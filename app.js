const express = require("express");
const exphbs = require("express-handlebars");
const flash = require("connect-flash");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var methodOverride = require("method-override");

const app = express();

// Connect to mongoose
// connect mongoose to database can be local or remote
mongoose
  .connect("mongodb://localhost:27017/vidjot-dev", {
    useNewUrlParser: true
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

// Load Idea Model
require("./models/Idea");
const Idea = mongoose.model("ideas");

// Handlebars Middleware
// tell system that we will use handlbars template engine and set default layout
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// How Middleware works
app.use(function(req, res, next) {
  console.log(Date.now());
  req.name = "John Doe";
  next();
});

// Body parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method Override Middleware
app.use(methodOverride("_method"));

// Express session Middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))

// Connect Flash Middleware
app.use(flash());

// Global variables
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Index Route---------------------
app.get("/", (req, res) => {
  const title = "Hello Welcome";
  console.log(req.name);
  res.render("index", { title: title });
});

// About Route--------------------
app.get("/about", (req, res) => {
  res.render("about");
});

// Idea Index Page
app.get("/ideas", (req, res) => {
  Idea.find({})
    .sort({ date: "desc" })
    .then(ideas => {
      res.render("ideas/index", {
        ideas: ideas
      });
    });
});

// Add Idea Form
app.get("/ideas/add", (req, res) => {
  res.render("ideas/add");
});

// Edit Idea Form
app.get("/ideas/edit/:id", (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    res.render("ideas/edit", {
      idea: idea
    });
  });
});

// Process Form
app.post("/ideas", (req, res) => {
  // console.log(req.body);

  // Form Validation
  let errors = [];
  if (!req.body.title) {
    errors.push({ text: "Please add a title" });
  }
  if (!req.body.details) {
    errors.push({ text: "Please add some details" });
  }
  if (errors.length > 0) {
    res.render("ideas/add", {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details
    };
    new Idea(newUser) // mongoose model
      .save()
      .then(idea => {
        req.flash('success_msg', 'Video idea added')
        res.redirect("/ideas");
      });
  }
});

// Edit Form Process
app.put("/ideas/:id", (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    // update values
    idea.title = req.body.title;
    idea.details = req.body.details;
    idea.save().then(idea => {
      req.flash('success_msg', 'Video idea updated')
      res.redirect("/ideas");
    });
  });
});

// Delete Idea
app.delete("/ideas/:id", (req, res) => {
  Idea.remove({_id: req.params.id})
    .then(()=>{
      req.flash('success_msg', 'Video idea removed')
      res.redirect('/ideas')
    })
});

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
