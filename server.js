// ==============================================================================
// Set Dependencies
// ==============================================================================

var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");

// ==============================================================================
// Express Setup
// create the express app
// set up the express app to handle the data parsing
// use express.static to serve static pages
// ==============================================================================

var app = express();
var PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ==============================================================================
// Handlebars Setup
// ==============================================================================

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// ==============================================================================
// Routing
// ==============================================================================

require("./routes/router")(app);

// ==============================================================================
// Server Listener
// ==============================================================================

app.listen(PORT, function() {
    console.log("Server listening on http://localhost:" + PORT);
});