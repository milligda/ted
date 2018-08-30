// ==============================================================================
// Set Dependencies & Required files
// ==============================================================================

var db = require("../models");
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");

// ==============================================================================
// Connect to MongoDB
// ==============================================================================

mongoose.connect("mongodb://localhost/tedTalks");

// ==============================================================================
// Routes
// ==============================================================================

module.exports = function(app) {
    app.get("/", function(req, res) {
        res.send("Hello World");
    });
}