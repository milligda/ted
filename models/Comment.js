// ==============================================================================
// Set Dependencies
// ==============================================================================

var mongoose = require("mongoose");

// ==============================================================================
// Establish the Schema
// ==============================================================================

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  user: String,
  body: String
});

// This creates our model from the above schema, using mongoose's model method
var Comment = mongoose.model("Comment", CommentSchema);

// Export the Note model
module.exports = Comment;
