// ==============================================================================
// Set Dependencies & Required files
// ==============================================================================

var db = require("../models");
var request = require("request");
var cheerio = require("cheerio");

// ==============================================================================
// Routes
// ==============================================================================

module.exports = function(app) {

    // Home page (Recent Talks page) 
    app.get("/", function(req, res) {

        // count the records in the database
        db.Talk.count({}, function(err, count) {
           
            // pull the latest 20 talks from the database
            db.Talk.find({}).limit(20)
            .then(function(dbTalks) {
                
                // create the display object
                var displayObj = {
                    pageTitle: "Recent Talks",
                    totalTalks: count,
                    recentTalks: dbTalks
                }
        
                res.render("recent", displayObj);    
            })
            .catch(function(err) {
                res.json(err);
            });
        });
    });

    // Community Favorites Page
    // Favorited Talks are pulled through an AJAX call when the page loads
    app.get("/favorites", function(req, res) {

        var displayObj = {
            pageTitle: "Favorite Talks",
        }

        res.render("favorites", displayObj);
    });

    // Individual Talk Page 
    app.get("/talk/:id", function(req, res) {

        db.Talk.findById(req.params.id)
        .then(function(dbTalk) {

            // create the display object
            var displayObj = {
                pageTitle: "Talk",
                talk: dbTalk
            }
    
            res.render("talk-page", displayObj);    
        })
        .catch(function(err) {
            res.json(err);
        });
    });

    // Scrapes the TED Talks site and stores any new talks
    app.get("/api/scrape", function(req, res) {
        request("https://www.ted.com/talks", function(error, response, html) {

            var $ = cheerio.load(html);

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

                // check if the Talk already exists in the database
                // if it doesn't, update the database
                db.Talk.findOneAndUpdate(
                    { "url": url },
                    result,
                    { upsert: true, new: true }, 
                    function(err, response) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.status(200);
                            res.end();
                        }
                    }
                );
            });
        });
    });

    // get the number of Talks in the database
    app.get("/api/talk-count", function(req, res) {
        db.Talk.count({}, function(err, count) {
            if (err) throw err;
            res.json(count);
        });
    });

    // get all Talks from the database and their corresponding comments
    app.get("/api/all-talks", function(req, res) {
        db.Talk.find({})
        .populate("comments")
        .then(function(dbTalks) {
            res.json(dbTalks);
        })
        .catch(function(err) {
            res.json(err);
        });
    });

    // get the last 20 Talks from the database
    app.get("/api/recent-talks", function(req, res) {
        db.Talk.find({}).limit(20)
        .then(function(dbTalks) {
            res.json(dbTalks);
        })
        .catch(function(err) {
            res.json(err);
        });
    });

    // get the last 20 Favorited Talks from the database 
    app.get("/api/saved-talks", function(req, res) {
        db.Talk.find({ saved: true }).limit(20)
        .then(function(dbTalks) {
            res.json(dbTalks);
        })
        .catch(function(err) {
            res.json(err);
        });
    });

    // get all the comments from the database
    app.get("/api/comments", function(req, res) {
        db.Comment.find({})
        .then(function(dbComments) {
            res.json(dbComments);
        })
        .catch(function(err) {
            res.json(err);
        });
    });

    // update a Talk with saved = true
    app.post("/api/save-talk/:id", function(req, res) {
        
        var talkId = req.params.id;

        db.Talk.findByIdAndUpdate(talkId, { saved: true })
        .then(function(dbTalk) {
            res.json(dbTalk);
        })
        .catch(function(err) {
            res.json(err);
        });
    });

    // update a Talk with saved = false
    app.post("/api/unsave-talk/:id", function(req, res) {

        var talkId = req.params.id;

        db.Talk.findByIdAndUpdate(talkId, { saved: false })
        .then(function(dbTalk) {
            res.json(dbTalk);
        })
        .catch(function(err) {
            res.json(err);
        });
    });

    // store a new comment in the database and update the corresponding Talk
    app.post("/api/comment/:id", function(req, res) {

        var talkId = req.params.id;

        // create the new comment
        db.Comment.create(req.body)
        .then(function(dbComment) {
            
            // after the comment has been created, update the Talk associated with the comment
            return db.Talk.findByIdAndUpdate(talkId, { $push: { comments: dbComment._id }, $set: { hasComments: true }}, { new: true });
        })
        .then(function(dbTalk) {
            res.json(dbTalk);
        })
        .catch(function(err) {
            res.json(err);
        });
    });

    // Get all the comments associated with a Talk
    app.get("/api/talk-comments/:id", function(req, res) {

        var talkId = req.params.id;

        db.Talk.findById(talkId)
        .populate("comments")
        .then(function(dbTalk) {
            res.json(dbTalk.comments);
        })
        .catch(function(err) {
            res.json(err);
        });
    });

    // Delete a comment from the database and update the corresponding Talk
    app.post("/api/delete-comment/:id", function(req, res) {

        var talkId = req.params.id;
        var commentId = req.body.commentId;

        // remove the comment from the Talk's comments array
        db.Talk.findByIdAndUpdate(talkId, { $pull: { comments: commentId }}, { new: true })
        .then(function(dbTalk) {

            console.log(dbTalk);
            
            // check if there are still 1 or more comments
            if (dbTalk.comments.length === 0) {
                db.Talk.findByIdAndUpdate(talkId, { hasComments: false })
                .then(function(dbTalkRevised) {
                    console.log(dbTalkRevised)
                });
            }

            // remove the comment from the database
            db.Comment.findByIdAndRemove(commentId)
            .then(function(dbComment) {
                res.json(dbComment);
            });
        });
    });
}
