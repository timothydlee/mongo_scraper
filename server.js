//requiring dependencies
var express 		= require('express');
var exphbs 			= require('express-handlebars');
var bodyParser 	= require('body-parser');
var mongoose 		= require('mongoose');
var request 		= require('request');
var cheerio 		= require('cheerio');
//Incorporating models
var Article 		= require('./models/Article.js');
var Comment 		= require('./models/Comment.js');

//Assigning var app to express();
var app = express();

app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(express.static('public'));

//Connection for dev purposes
// mongoose.connect('mongodb://localhost/newsscraper')

//Connect when ready to deploy to Heroku
mongoose.connect('mongodb://heroku_wz6l96kq:ubnrroqm6j2ucpgvekid0lp7ej@ds117829.mlab.com:17829/heroku_wz6l96kq');
var db = mongoose.connection;
db.on('error', function (err) {
	console.log('Mongoose Error: ', err);
});

//Setting handlebars as view engine
app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Routes
app.get('/', function (req, res) {
	res.redirect('/scraping');
});

//Scraping site news.ycombinator.com/
app.get('/scraping', (req, res) => {
	var url = 'https://www.cinemablend.com/news.php/';
	var linkUrl = 'https://www.cinemablend.com/news';
	request.get(url, (err, request, body) => {
		var $ = cheerio.load(body);

		//For each title class with a href http or https
		$('.story_item a').each((index, element) => {
			var result = {};

			result.title = $(element)[0].attribs.title;
			result.link = linkUrl + $(element)[0].attribs.href;
			console.log(result.link);

			//creating new instance of Article
			var article = new Article(result);
			//saving article to MongoDB
			article.save((err, doc) => {
				//Messages for dev purposes
				if (err) {
					console.log('Already scraped');
				} else {
					console.log('New article scraped');
				}
			});
		});
	});
	//Redirecting to /articles route
	res.redirect('/articles');
});

//Default route that gets all the articles in the database
app.get('/articles', (req, res) => {
	Article.find({}, (err, doc) => {
		//Displays error if any
		if (err) {
			console.log(err);
		}
		//Otherwise, renders articles handlebar template
		else {
			res.render('articles', {
				//"articles" is the variable that will get looped over in articles.handlebars
				articles: doc
			});
		}
	});
});

//Creates get route to update articles with id parameter :id
app.get('/articles/:id', (req, res) => {
	//Mongoose to find the article with the id as set forth in the route
	Article.findOne({'_id': req.params.id})
		//Populates the comments
		.populate('comments')
		//Executes the query
		.exec((err, doc) => {
			//consoles error if any
			if (err) {
				console.log(err);
			}
			//Else renders comments handlebars
			else {
				res.render('comments', {
					//Utilizes article as the variable that is looped over each instance of comments for a particular article to display all comments
					article: doc
				});
			}
	});
});

//Post route for posting comments
app.post('/articles/:id', (req, res) => {
	//Creates new instance of Comment model with the req.body as the body of it
	var newComment = new Comment(req.body);

	//Saves new comment via Mongoose
	newComment.save((err, doc) => {
		//If error, console log error
		if (err) {
			console.log(err);
			//Else updates article with id :id to include a new comment with same id
		} else {
			var articleId = req.params.id;
			Article.findOneAndUpdate({'_id': articleId}, {$push: {'comments': doc._id}})
				.exec((err, doc) => {
					if (err) {
						console.log(err);
					} else {
						//Redirects to the specific article's comment page
						res.redirect('/articles/' + articleId);
					}
				});
		}
	});
});

//Post route to delete a comment
app.post('/articles/:aId/delete/:cId', (req, res) => {
	var articleId = req.params.aId;
	var commentId = req.params.cId;
	//Update method in mongoose that searches for the id in the url, pulls the comments with the comment id in the url
	Article.update({'_id': articleId}, {$pull: {'comments': commentId}}, {'multi': false}, (err, res) => {
		//consoles error
		if (err) {
			console.log(err);
			//else removes comment of that id
		} else {
			Comment.remove({'_id': commentId}, (err, res) => {
				if(err) {
					console.log(err);
				} else {
					console.log('Comment deleted');
				}
			});
		}
	});

	res.redirect('/articles/' + articleId);
});

//Get route to display saved articles
app.get('/saved', (req, res) => {
	//Finds articles where saved is true
	Article.find({ 'saved' : true }, (err, doc) => {
		if (err) {
			console.log(err);
		}  else {
			//Renders saved articles handlebars
			res.render('articles-saved', {
				articles: doc
			});
		}
	})
});

//Setting route to update an article to saved = true if user clicks "save article"
app.post('/saved/:id', (req, res) => {
	Article.update({ '_id' : req.params.id }, { $set : { 'saved' : true }}, (err, res) => (err) ? console.log(err) : console.log(res)); 
	res.redirect('/articles');
})

//Unsaves article
app.post('/unsaved/:id', (req, res) => {
	//Updates article with parametre _id by setting parameter saved to false
	Article.update( { '_id' : req.params.id }, { $set : { 'saved' : false }}, (err, res) => (err) ? console.log(err) : console.log(res));
	//Redirects to saved articles
	res.redirect('/saved');
});

//Listening to the port 3000 or the environment PORT
app.listen(process.env.PORT || 3000, () => {
	console.log('App running on port 3000');
});
