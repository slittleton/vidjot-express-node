const express = require("express");
const path = require('path');
const exphbs = require("express-handlebars");
const flash = require("connect-flash");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var methodOverride = require("method-override");

const app = express();

// Load Routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Connect to mongoose
// connect mongoose to database can be local or remote
mongoose
  .connect("mongodb://localhost:27017/vidjot-dev", {
    useNewUrlParser: true
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

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

//Static Folder
app.use(express.static(path.join(__dirname, 'public')))

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


// Use Routes
app.use('/ideas', ideas);
app.use('/users', users);

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
