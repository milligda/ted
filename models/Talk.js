// ==============================================================================
// Set Dependencies
// ==============================================================================

var mongoose = require("mongoose");

// ==============================================================================
// Establish the Schema
// ==============================================================================

var Schema = mongoose.Schema;

var TalkSchema = new Schema({

    title: {
        type: String,
        required: true
    },
    talk_length: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    presenter: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    saved: {
        type: Boolean,
        default: false
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    hasComments: {
        type: Boolean,
        default: false
    }
});

// ==============================================================================
// Create & Export the Model
// ==============================================================================

// create the Talk model
var Talk = mongoose.model("Talk", TalkSchema);

module.exports = Talk;