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

        var displayObj = {
            title: "Recent Talks",
        }

        res.render("recent", displayObj);
    });

    app.get("/favorites", function(req, res) {

        var displayObj = {
            title: "Favorite Talks",
        }

        res.render("favorites", displayObj);
    });

    app.get("/api/scrape", function(req, res) {
        request("https://www.ted.com/talks", function(error, response, html) {

            var $ = cheerio.load(html);

            var newTalks = [];

            $("div.talk-link").each(function(i, element, newPosts) {

                var result = {};

                // get the full title - includes the talk length
                var titleFull = $(element).find("a.ga-link").text();

                // split the full title into the talk length and the title
                var titleArr = titleFull.split("\n\n");

                // store the length and remove any unnecessary line breaks or spaces
                var length = titleArr[0].replace(/\n/, '').trim();

                // store the title and remove any unnecessary line breaks or spaces
                var title = titleArr[1].replace(/\n/g, '').trim();

                // store the url
                var urlSlug = $(element).find("a.ga-link").attr("href");
                var url = "https://www.ted.com" + urlSlug;

                // store the presenter
                var presenter = $(element).find("h4.talk-link__speaker").text();

                // store the image thumbnail url
                var imageThumbUrl = $(element).find("img.thumb__image").attr("src");

                // remove everything after the ? from the image thumbnail to get the full image
                var imageUrl = imageThumbUrl.replace(/\?.*/, '');

                // push the components into the result object
                result.title = title;
                result.talk_length = length;
                result.url = url;
                result.presenter = presenter;
                result.image_url = imageUrl;

                db.Talk.findOneAndUpdate(
                    { "url": url },
                    result,
                    { upsert: true, new: true }, 
                    function(err, response) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(response);
                            
                            res.write("new talk");
                        }
                    }
                );
            });
        });
        // res.json({ scraped: true });
    });

    app.get("/api/all-talks", function(req, res) {
        db.Talk.find({})
        .then(function(dbTalks) {
            res.json(dbTalks);
        })
        .catch(function(err) {
            res.json(err);
        });
    });

    app.get("/api/recent-talks", function(req, res) {
        db.Talk.find({}).limit(20)
        .then(function(dbTalks) {
            res.json(dbTalks);
        })
        .catch(function(err) {
            res.json(err);
        });
    });

    app.get("/api/saved-talks", function(req, res) {
        db.Talk.find({saved: true}).limit(20)
        .then(function(dbTalks) {
            res.json(dbTalks);
        })
        .catch(function(err) {
            res.json(err);
        });
    });

    app.post("/api/save-talk/:id", function(req, res) {
        
        var talkId = req.params.id;

        db.Talk.findByIdAndUpdate(talkId, {saved: true})
        .then(function(dbTalk) {
            res.json(dbTalk);
        })
        .catch(function(err) {
            res.json(err);
        });
    });

    app.post("/api/unsave-talk/:id", function(req, res) {

        var talkId = req.params.id;

        db.Talk.findByIdAndUpdate(talkId, {saved: false})
        .then(function(dbTalk) {
            res.json(dbTalk);
        })
        .catch(function(err) {
            res.json(err);
        });
    });
}
