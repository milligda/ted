// ==============================================================================
// Global Variables
// ==============================================================================

var startingTalkCount;
var talkCountInt;

// ==============================================================================
// Functions to Populate Pages with Talks
// ==============================================================================

// when the Recent Talks page loads, store how many Talks are in the database
function storeTalkCount() {
    startingTalkCount = $("#recent-talks-container").attr("data-count");
    talkCountInt = parseInt(startingTalkCount);
    console.log(talkCountInt);
}

// Scrape the Ted Talks site for any new Talks
// after the scrape is complete, call the getTalkCount function
function scrapeTalks() {
    $.get("/api/scrape", function(response) {
        setTimeout(getTalkCount, 1000);
    });
}

// After the scrape, get the number of Talks in the database again
// If the number of talks in the database after scraping is the same as when the page loads, do nothing
// If the number of talks in the database after scraping is different, display the message saying there are new talks available
function getTalkCount() {
    $.get("/api/talk-count", function(response) {
        console.log(response);
        if (response === talkCountInt) {
            console.log("no new talks");
        } else {
            $("#new-talks-message").fadeIn(1000);
        }
    });
}

// get the articles that have been favorited and pass them to the displayFavoriteTalk function
function getFavoritesArticles() {
    $.get("/api/saved-talks", function(response) {
        if (response !== null) {
            for (var i = 0; i < response.length; i++) {
                displayFavoriteTalk(response[i]);
            }
        }
    });
}

function displayFavoriteTalk(talk) {

    // create the talk container
    var talkContainer = populateTalks(talk);

    // append the talk container to the favorite-talks-container
    talkContainer.appendTo('#favorite-talks-container');
}

function populateTalks(talk) {

    // create the components for the Talk
    var talkContainer = $('<div class="talk">');
    var imageContainer = $('<div class="main-talk-image-container">');
    var imageLink = $('<a href="' + talk.url + '" target="_blank">');
    var image = $('<img class="main-talk-image" src="' + talk.image_url + '">');
    var duration = $('<p class="overlay-duration">').text(talk.talk_length);
    var titleLink = $('<a href="' + talk.url + '" target="_blank">');
    var title = $('<h4 class="main-talk-title">').text(talk.title);
    var presenter = $('<p class="main-talk-presenter">').text(talk.presenter);
    var commentsPageLink = $('<a href="/talk/' + talk._id + '">');

    // create the favorite icon for the Talk
    // use the favorited icon if the Talk has been saved
    if (talk.saved) {
        var favoriteIcon = $('<img class="overlay-icon favorite-icon" data-id="' + talk._id + '" data-status="saved" src="/assets/images/favorite-icon.svg">');
    } else {
        var favoriteIcon = $('<img class="overlay-icon favorite-icon" data-id="' + talk._id + '" data-status="unsaved" src="/assets/images/add-favorite-icon.svg">');
    }

    // create the comments icon for the Talk
    // use the correct icon depending on if the Talk has comments
    if (talk.hasComments) {
        var commentIcon = $('<img class="overlay-comment-icon comment-icon" src="/assets/images/has-comments-icon.svg">');
    } else {
        var commentIcon = $('<img class="overlay-comment-icon comment-icon" src="/assets/images/no-comments-icon.svg">');
    }

    // append the components to the talk container
    imageLink.append(image).append(duration);
    commentsPageLink.append(commentIcon);
    imageContainer.append(imageLink).append(favoriteIcon).append(commentsPageLink);
    titleLink.append(title).append(presenter);
    talkContainer.append(imageContainer).append(titleLink);

    return talkContainer;
}

// ==============================================================================
// Functions to Populate Comments
// ==============================================================================

// get the Talk ID when an individual talk page is loaded
function getTalkId() {
    var talkId = window.location.href.replace('http://localhost:3000/talk/', '');
    return talkId;
}

function getTalkComments(id) {

    // empty the comments container
    $(".all-comments-container").empty();

    $.get("/api/talk-comments/" + id, function(response) {
        console.log(response);

        if (response.length > 0) {
            populateComments(response);
        } else {
            displayNoCommentsMessage();
        }
    });
}

function populateComments(commentsArr) {

    // for each comment in the comments array create the comment
    for (var i = 0; i < commentsArr.length; i++) {

        // create the components for the comment
        var commentContainer = $('<div class="comment">');
        var authorAndDelete = $('<p><span class="comment-author">' + commentsArr[i].user + '</span> <span data-id="' + commentsArr[i]._id + '" class="comment-delete">(remove as inappropriate)</span></p>');
        var commentBody = $('<p class="comment-body">').text(commentsArr[i].body);

        // append the components to the all-comments-container
        commentContainer.append(authorAndDelete).append(commentBody);
        commentContainer.appendTo(".all-comments-container");
    }
}

function displayNoCommentsMessage() {

    // message if there are no comments for a talk
    var message = $('<p class="no-comments-message">').text("This TED talk does not have any comments yet.");
    message.appendTo(".all-comments-container");
}

// ==============================================================================
// Functions for Favoriting and Unfavoriting a Talk
// ==============================================================================

function saveArticle(id) {

    $.post("/api/save-talk/" + id, function(response) {
        location.reload();
    });
}

function unsaveArticle(id) {

    $.post("api/unsave-talk/" + id, function(resposne) {
        location.reload();
    });
}

// ==============================================================================
// Event Listeners
// ==============================================================================

// when the favorite-icon is clicked
$(document).on("click", ".favorite-icon", function(event) {
    event.preventDefault();

    // store the Talk's id and determine if the Talk is saved or unsaved
    var talkId = $(this).attr("data-id");
    var talkStatus = $(this).attr("data-status");

    // if the Talk is saved, call the unsaveArticle function
    if (talkStatus === "saved") {
        unsaveArticle(talkId);
    }

    // if the talk is unsaved, call the saveArticle function
    if (talkStatus === "unsaved") {
        saveArticle(talkId);
    }
});

// when the reload page button is clicked, reload the page to display the most recent TED talks
$(document).on("click", ".reload-page-btn", function(event) {
    location.reload();
});

// dismiss the message saying that new talks are available
$(document).on("click", ".dismiss-btn", function(event) {
    event.preventDefault();
    $("#new-talks-message").fadeOut(500);
});

// when the submit comment button is clicked
$(document).on("click", ".submit-btn", function(event) {
    event.preventDefault();

    // store the Talk's ID
    var talkId = $(this).attr("data-id");

    // post the new comment
    $.ajax({
        method: "POST",
        url: "/api/comment/" + talkId,
        data: {
            user: $("#commentNameInput").val().trim(),
            body: $("#commentInput").val().trim()
        }
    })
    .then(function(response) {
        console.log(response);

        // re-populate the comments container after receiving the response
        getTalkComments(talkId);
    });

    // clear the comment input fields
    $("#commentNameInput").val("");
    $("#commentInput").val("");
});

// when the option to remove an inappropriate comment has been clicked
$(document).on("click", ".comment-delete", function(event) {
    event.preventDefault();

    // store the Talk ID and the Comment ID
    var talkId = getTalkId();
    var commentId = $(this).attr("data-id");

    // post the new comment
    $.ajax({
        method: "POST",
        url: "/api/delete-comment/" + talkId,
        data: {
            commentId: commentId
        }
    })
    .then(function(response) {
        console.log(response);

        // re-populate the comments container after receiving the response
        getTalkComments(talkId);
    });

})

// ==============================================================================
// Page Load Processes
// ==============================================================================

$(function() {

    // functions to run when the Recent Talks page is loaded
    if (document.getElementById("recent-page")) {
        storeTalkCount();
        scrapeTalks();
    }

    // functions to run when the Community Favorites page is loaded
    if (document.getElementById("favorites-page")) {
        getFavoritesArticles();
    }

    // functions to run when an individual Talk page is loaded
    if (document.getElementById("talk-page")) {
        var talkId = getTalkId();
        getTalkComments(talkId);
    }
    
});
