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

    app.get("/scrape", function(req, res) {
        request("https://www.ted.com/talks", function(error, response, html) {

            var $ = cheerio.load(html);

            $("div.talk-link").each(function(i, element) {

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

                db.Talk.find({url: url}, function(err, response) {
                    if (! response.length) {
                        db.Talk.create(result)
                        .then(function(dbTalk) {
                            console.log(dbTalk);
                        })
                        .catch(function(err) {
                            return res.json(err);
                        });
                    }
                });
            });
        });

        res.json({ scraped: true });
    });

    app.get("/api-talks", function(req, res) {
        db.Talk.find({}).sort({ date: -1 }).limit(20)
        .then(function(dbTalks) {
            res.json(dbTalks);
        })
        .catch(function(err) {
            res.json(err);
        });
    });
}
