// =============================Toggling between showing and hiding Home and Saved Articles, displaying appropriately====================================

function showSavedArticles() {
	let homeJumbo = document.querySelector('.home-jumbotron');
	let savedJumbo = document.querySelector('.saved-articles-jumbotron');
	let homeArticles = document.getElementById('articles');
	homeJumbo.classList.add('hidden');
	homeArticles.classList.add('hidden');
	savedJumbo.classList.remove('hidden');
	$("#articles").empty();
	$("#savedarticles").empty();
	$.getJSON('/saved', (data) => {
		data.map((savedarticle) => {
			//Assigning article.title, article.img...
			let { title, img, link, desc, _id } = savedarticle;
			console.log(savedarticle.title)
			
			//Appending each article and 3 buttons to the DOM
			$("#savedarticles").append(`
				<div class="panel article">
					<h2>${title}</h2> 
					<p>${img}</p> 
					<p>${desc}</p> 
					<button type='button' class='btn btn-primary' id="article_link"><a target='_blank' href='http://${link}'>Read More</a></button>
					<button type="submit" class="btn btn-success unsave-article" data-id="${_id}" data-toggle="modal" data-target="#unsave-articles-modal">Click to Unsave Article</button>
					<button type="button" class="btn btn-secondary comment" data-id="${_id}">Comment</button>
				</div>
				<br><br>`);
		});
	})
};

let articlesButton = document.querySelector('.saved-articles-button');
articlesButton.addEventListener('click', showSavedArticles);

function showHome() {
	$("#savedarticles").empty();
	let homeJumbo = document.querySelector('.home-jumbotron');
	let savedJumbo = document.querySelector('.saved-articles-jumbotron');
	let homeArticles = document.getElementById('articles');
	homeJumbo.classList.remove('hidden');
	homeArticles.classList.remove('hidden');
	savedJumbo.classList.add('hidden');
	appendScrapedArticles();
};

const homeButton = document.querySelector("#home-button");
homeButton.addEventListener('click', showHome);

// =================================================================================================================================================

// =============================Function that appends scraped articles====================================
function appendScrapedArticles() {
	$.getJSON('/articles', (data) => {
		//Response data array is mapped
		data.map((article) => {
			//Assigning article.title, article.img...
			let { title, img, link, desc, _id } = article;
			
			//Appending each article and 3 buttons to the DOM
			$("#articles").append(`
				<div class="panel article">
					<h2>${title}</h2> 
					<p>${img}</p> 
					<p>${desc}</p> 
					<button type='button' class='btn btn-primary' id="article_link"><a target='_blank' href='http://${link}'>Read More</a></button>
					<button type="submit" class="btn btn-success save-article" data-id="${_id}" data-toggle="modal" data-target="#saved-articles-modal">Click to Save Article</button>
					<button type="button" class="btn btn-secondary comment" data-id="${_id}" data-toggle="modal" data-target="#comment-modal">Comment</button>
				</div>
				<br><br>`);
		});
	});
}
// =================================================================================================================================================


// ==================================== Scrape Articles Button ================================================================

$(document).on("click", "#scrape-button", () => {
	$("#articles").empty();
	//Grabbing articles from MongoDB BSON as JSON
	$.getJSON('/articles', (data) => {
		$("#scraped-modal-text").html(`<h3>You've scraped ${data.length} total articles</h3>`);
	});
	//Runs showHome function to display all articles.
	showHome();
});

// =================================================================================================================================================


// ================================Saving Articles===============================================================================
$(document).on('click', '.save-article', function() {
	const thisId = $(this).attr('data-id');
	// console.log(thisId);
	$.post(`/saved/${thisId}`).done((data) => {
		console.log(data);
	});

	$("#saved-articles-modal-text").html("<h3>Article successfully saved!<h3>");
});
// =================================================================================================================================================


// ================================Unsaving Articles===============================================================================
$(document).on('click', '.unsave-article', function() {
	$("#savedarticles").empty();
	const thisId = $(this).attr('data-id');
	$.post(`/unsaved/${thisId}`).done((data) => {
		console.log(data);
	});

	$("#unsaved-articles-modal-text").html("<h3>Article successfully unsaved!<h3>");
	showSavedArticles();
});
// =================================================================================================================================================


//Getting the comment modal to pop up and generate a comment form
$(document).on('click', '.comment', function() {
	let thisId = $(this).attr('data-id');
	generateCommentForm(thisId);
});

function generateCommentForm(id) {
	$.get(`/articles/${id}`)
	.done((data) => {
		console.log(data);
		if (data.note) {
			$('.previous_comments').empty();
			$('.previous_comments').append(data.note.title);
		};
		$("#comment-form").html(`
			<form id="comment-form">	
				<div class="form-group">
					<label for="title">Title</label>
					<input type="text" class="form-control" id="comment_title">
					<label for="comment">Comment</label>
					<textarea type="text" class="form-control input-large search-query" id="comment_comment"></textarea>
				</div>
			</form>
			<button type="button" class="btn btn-secondary" data-dismiss="modal" data-id="${id}"" id="savenote">Submit</button>
			<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
		`)
	});
};


$(document).on('click', '#savenote', function() {
	let thisId = $(this).attr('data-id');
	$.post(`/articles/${thisId}`, {
		title: $("#comment_title").val(),
		body: $("#comment_comment").val()
	}).done((data) => {
		console.log("success");
	})
});
















// // When you click the savenote button
// $(document).on("click", "#savenote", function() {
// 	// Grab the id associated with the article from the submit button
// 	var thisId = $(this).attr("data-id");

// 	// Run a POST request to change the note, using what's entered in the inputs
// 	$.ajax({
// 		method: "POST",
// 		url: "/articles/" + thisId,
// 		data: {
// 			// Value taken from title input
// 			title: $("#titleinput").val(),
// 			// Value taken from note textarea
// 			body: $("#bodyinput").val()
// 		}
// 	})
// 		// With that done
// 		.done(function(data) {
// 			// Log the response
// 			console.log(data);
// 			// Empty the notes section
// 			$("#notes").empty();
// 		});

// 	// Also, remove the values entered in the input and textarea for note entry
// 	$("#titleinput").val("");
// 	$("#bodyinput").val("");
// });










// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
	// Empty the notes from the note section
	$("#notes").empty();
	// Save the id from the p tag
	var thisId = $(this).attr("data-id");

	// Now make an ajax call for the Article
	$.ajax({
		method: "GET",
		url: "/articles/" + thisId
	})
		// With that done, add the note information to the page
		.done(function(data) {
			console.log(data);
			// The title of the article
			$("#notes").append("<h2>" + data.title + "</h2>");
			// An input to enter a new title
			$("#notes").append("<input id='titleinput' name='title' >");
			// A textarea to add a new note body
			$("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
			// A button to submit a new note, with the id of the article saved to it
			$("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

			// If there's a note in the article
			if (data.note) {
				// Place the title of the note in the title input
				$("#titleinput").val(data.note.title);
				// Place the body of the note in the body textarea
				$("#bodyinput").val(data.note.body);
			}
		});
});