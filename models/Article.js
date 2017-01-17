//Require mongoose
let mongoose = require('mongoose');
let uniqueValidator = require('mongoose-unique-validator');
//Create Schema class
let Schema = mongoose.Schema;

//Create Article Schema
let ArticleSchema = new Schema({
  //Title is a required string
  title: {
    type: String,
    unique: true,
    required: true
  },
  //Link is required string
  link: {
    type: String,
    required: true
  },
  //Img is string
  img: {
    type: String
  },
  desc: {
    type: String
  },
  saved: {
    type: Boolean,
    default: false
  },
  //This only saves one note's ObjectId, ref refers to the Note model
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

ArticleSchema.plugin(uniqueValidator);

//Create the Article model with the ArticleSchema
let Article = mongoose.model('Article', ArticleSchema);

//Export the model
module.exports = Article;
