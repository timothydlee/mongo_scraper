// Dependencies
var express     = require("express");
var bodyParser  = require("body-parser");
var logger      = require("morgan");
var mongoose    = require("mongoose");
// Requiring our Note and Article models
var Note        = require("./models/Note.js");
var Article     = require("./models/Article.js");
// Our scraping tools
var request 		= require("request");
var cheerio 		= require("cheerio");
// Mongoose mpromise deprecated - use bluebird promises
var Promise 		= require("bluebird");

mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/mongoscraperhw");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", (error) =>	console.log("Mongoose Error: ", error));

// Once logged in to the db through mongoose, log a success message
db.once("open", () => console.log("Mongoose connection successful."));


// Routes
// ======

// Simple index route
app.get("/", function(req, res) {
	res.send(index.html);
});

//Get route that scrapes The Onion politics section
app.get('/scrape', function(req, res){
	//Grab body of the html with request
	request('http://www.theonion.com/section/politics/', function(error, response, html) {
		//Load into cheerio and save it to $ for a shorthand selector
		var $ = cheerio.load(html);
		//Grabbing every element with class "summary"
		$('.summary').each(function(i, element) {
			//Create object that will hold scraped data
			let result = {};
			//Finding the image, link, title, and description of each article
			result.img 		= $(this).find('.image').children('noscript').html();
			result.link		= "www.theonion.com"+$(this).children('a').attr('href');
			result.title 	= $(this).find('.headline').children('a').attr('title');
			result.desc 	= $(this).find('.desc').text();
			// console.log(`${result.image}`);
			// console.log(`www.theonion.com${result.link}`);
			// console.log(`${result.title}`)
			// console.log(`${result.desc}`)
			//Using Article model to create new entry
			let entry = new Article(result);

			//Using article mode, creating new entry, logging errors (if any), else logging the doc
			entry.save((err, doc) => (err) ? console.log(err) : console.log(doc));
		});
	});
	//Renders text to browser "Scrape Complete"
	res.send("Scrape Complete");
});

//Retreiving articles that we scraped from MongoDB
app.get('/articles', (req, res) => {
	//Grabbing every doc in the Articles array, call back function that logs error if any, else sends the doc to the browser as JSON object
	Article.find({}, (err, doc) => (err) ? console.log(err) : res.json(doc));
})

//Searching for an article by its ID
app.get('/articles/:id', (req, res) => {
	//Using ID passed in the :id parameter, setting up a query that finds the matching one in the db
	Article.findOne({ '_id': req.params.id })

	//Populate all of the notes associated with it
	.populate('note')

	//Execute the query, console logging error if any, else send doc to browser as JSON
	.exec((err, doc) => (err) ? console.log(err) : res.json(doc));
})

//Create a new note or replace an existing note
app.post('/articles/:id', (req, res) => {
	//Create new instance of Note, pass req.body into entry
	let newNote = new Note(req.body);

	//Save new note to mongo
	newNote.save((err, doc) => {
		//Logs any errors
		if (err) throw err;
		//Otherwise, uses article's id to search db for the same id to update the note
		Article.findOneAndUpdate({ '_id': req.params.id }, { 'note': doc._id })
		//Executes query, logs err if any, otherwise sends doc to browser
		.exec((err, doc) => (err) ? console.log(err) : res.send(doc));
	});
});

// // Create a new note or replace an existing note
// app.post("/articles/:id", function(req, res) {
//   // Create a new note and pass the req.body to the entry
//   var newNote = new Note(req.body);

//   // And save the new note the db
//   newNote.save(function(error, doc) {
//     // Log any errors
//     if (error) {
//       console.log(error);
//     }
//     // Otherwise
//     else {
//       // Use the article id to find and update it's note
//       Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
//       // Execute the above query
//       .exec(function(err, doc) {
//         // Log any errors
//         if (err) {
//           console.log(err);
//         }
//         else {
//           // Or send the document to the browser
//           res.send(doc);
//         }
//       });
//     }
//   });
// });


// Listen on port 3000
app.listen(process.env.PORT || 3000, () => console.log('App running on port 3000!'));