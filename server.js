var express 	= require('express');
var exphbs 		= require('express-handlebars');
var bodyParser 	= require('body-parser');
var mongoose 	= require('mongoose');
var request 	= require('request');
var cheerio 	= require('cheerio');

var Article 	= require('./models/Article.js');
var Comment 	= require('./models/Comment.js');

var app = express();

app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(express.static('public'));

mongoose.connect('mongodb://heroku_wz6l96kq:ubnrroqm6j2ucpgvekid0lp7ej@ds117829.mlab.com:17829/heroku_wz6l96kq');
var db = mongoose.connection;
db.on('error', function (err) {
	console.log('Mongoose Error: ', err);
});

app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Routes
app.get('/', function (req, res) {
	res.redirect('/scraping');
});

app.get('/scraping', function (req, res) {
	request.get('https://news.ycombinator.com/', function (err, request, body) {
		var $ = cheerio.load(body);

		$('.title a[href^="http"], a[href^="https"]').each(function (index, element) {
			var result = {};

			result.title = $(element)[0].children[0].data
			result.link = $(element)[0].attribs.href;

			var entry = new Article(result);

			entry.save(function (err, doc) {
				if (err) {
					console.log('Article already in database');
				} else {
					console.log('Finished scraping');
				}
			})
		});
	});
	res.redirect('/articles');
});

app.get('/articles', function (req, res) {
	Article.find({}, function (err, doc) {
		if (err) {
			console.log(err);
		}
		else {
			res.render('articles', {
				articles: doc
			});
		}
	});
});

app.get('/articles/:id', function (req, res) {
	Article.findOne({'_id': req.params.id})
		.populate('comments')
		.exec(function (err, doc) {
			if (err) {
				console.log(err);
			}
			else {
				// console.log(doc);
				res.render('comments', {
					article: doc
				});
			}
		});
});

app.post('/articles/:id', function (req, res) {
	var comment = req.body;
	var newComment = new Comment(comment);

	newComment.save(function (err, doc) {
		if (err) {
			console.log(err);
		} else {
			var articleId = req.params.id;
			Article.findOneAndUpdate({'_id': articleId}, {$push: {'comments': doc._id}})
				.exec(function (err, doc) {
					if (err) {
						console.log(err);
					} else {
						res.redirect('/articles/' + articleId);
					}
				});
		}
	});
});

app.post('/articles/:aId/delete/:cId', function (req, res) {
	var articleId = req.params.aId;
	var commentId = req.params.cId;

	Article.update({'_id': articleId}, {$pull: {'comments': commentId}}, {'multi': false}, function (err, res) {
		if (err) {
			console.log(err);
		} else {
			Comment.remove({'_id': commentId}, function (err, res) {
				if(err) {
					console.log(err);
				} else {
					console.log('Successful deletion of comment');
				}
			});
		}
	});

	res.redirect('/articles/' + articleId);
});

app.listen(3000, function () {
	console.log('App running on port 3000');
});