// ==============================================================================
// Global Variables
// ==============================================================================

var startingTalkCount;
var talkCountInt;

// ==============================================================================
// Functions to Populate Pages with Talks
// ==============================================================================

// function getRecentArticles() {
//     $.get("/api/recent-talks", function(response) {

//         if (response !== null) {
//             for (var i = 0; i < response.length; i++) {
//                 displayRecentTalk(response[i]);
//             }
//         }
//     });
// }

function storeTalkCount() {
    startingTalkCount = $("#recent-talks-container").attr("data-count");
    talkCountInt = parseInt(startingTalkCount);
    console.log(talkCountInt);
}

function scrapeTalks() {
    $.get("/api/scrape", function(response) {
        setTimeout(getTalkCount, 1000);
    });
}

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

function getFavoritesArticles() {
    $.get("/api/saved-talks", function(response) {
        if (response !== null) {
            for (var i = 0; i < response.length; i++) {
                displayFavoriteTalk(response[i]);
            }
        }
    });
}

function createTalkContainer(talk) {

    // create the components for the Talk
    var talkContainer = $('<div class="talk">');
    var imageContainer = $('<div class="main-talk-image-container">');
    var imageLink = $('<a href="' + talk.url + '">');
    var image = $('<img class="main-talk-image" src="' + talk.image_url + '">');
    var duration = $('<p class="overlay-duration">').text(talk.talk_length);
    var titleLink = $('<a href="' + talk.url + '">');
    var title = $('<h4 class="main-talk-title">').text(talk.title);
    var presenter = $('<p class="main-talk-presenter">').text(talk.presenter);

    // create the favorite icon for the Talk
    // use the favorited icon if the Talk has been saved
    if (talk.saved) {
        var favoriteIcon = $('<img class="overlay-icon favorite-icon" data-id="' + talk._id + '" data-status="saved" src="/assets/images/favorite-icon.svg">');
    } else {
        var favoriteIcon = $('<img class="overlay-icon favorite-icon" data-id="' + talk._id + '" data-status="unsaved" src="/assets/images/add-favorite-icon.svg">');
    }

    // append the components to the talk container
    imageLink.append(image).append(duration);
    imageContainer.append(imageLink).append(favoriteIcon);
    titleLink.append(title).append(presenter);
    talkContainer.append(imageContainer).append(titleLink);

    return talkContainer;

}

// function displayRecentTalk(talk) {

//     // create the talk container
//     var talkContainer = createTalkContainer(talk);

//     // append the talk container to the recent-talks-container
//     talkContainer.appendTo('#recent-talks-container');
// }

function displayFavoriteTalk(talk) {

    // create the talk container
    var talkContainer = createTalkContainer(talk);

    // append the talk container to the favorite-talks-container
    talkContainer.appendTo('#favorite-talks-container');
}

// ==============================================================================
// Functions for Favoriting a Talk
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

$(document).on("click", ".favorite-icon", function(event) {
    event.preventDefault();

    var talkId = $(this).attr("data-id");
    var talkStatus = $(this).attr("data-status");

    if (talkStatus === "saved") {
        unsaveArticle(talkId);
    }

    if (talkStatus === "unsaved") {
        saveArticle(talkId);
    }
});

$(document).on("click", ".reload-page-btn", function(event) {
    location.reload();
});

$(document).on("click", ".dismiss-btn", function(event) {
    event.preventDefault();
    $("#new-talks-message").fadeOut(500);
})

// ==============================================================================
// Page Load Processes
// ==============================================================================

$(function() {
    if (document.getElementById("recent-page")) {
        storeTalkCount();
        scrapeTalks();
    }

    if (document.getElementById("favorites-page")) {
        getFavoritesArticles();
    }
    
});
