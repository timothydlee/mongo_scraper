// =============================Toggling between showing and hiding Home and Saved Articles====================================

function showSavedArticles() {
	let homeJumbo = document.querySelector('.home-jumbotron');
	let savedJumbo = document.querySelector('.saved-articles-jumbotron');
	let homeArticles = document.getElementById('articles');
	homeJumbo.classList.add('hidden');
	homeArticles.classList.add('hidden');
	savedJumbo.classList.remove('hidden');
	$("#articles").empty();
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
	let homeJumbo = document.querySelector('.home-jumbotron');
	let savedJumbo = document.querySelector('.saved-articles-jumbotron');
	let homeArticles = document.getElementById('articles');
	homeJumbo.classList.remove('hidden');
	homeArticles.classList.remove('hidden');
	savedJumbo.classList.add('hidden');
};

const homeButton = document.querySelector("#home-button");
homeButton.addEventListener('click', showHome);

// =================================================================================================================================================


// ==================================== Scraping Articles ================================================================

$(document).on("click", "#scrape-button", () => {
	$("#articles").empty();
	//Grabbing articles from MongoDB BSON as JSON
	$.getJSON('/articles', (data) => {
		$("#scraped-modal-text").html(`<h3>You've scraped ${data.length} total articles</h3>`);

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
					<button type="button" class="btn btn-secondary comment" data-id="${_id}">Comment</button>
				</div>
				<br><br>`);
		});
	});
	//Runs showHome function, in the event that someone clicks Scrape button but is looking at their Saved Articles.
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

// When you click the savenote button
$(document).on("click", "#savenote", function() {
	// Grab the id associated with the article from the submit button
	var thisId = $(this).attr("data-id");

	// Run a POST request to change the note, using what's entered in the inputs
	$.ajax({
		method: "POST",
		url: "/articles/" + thisId,
		data: {
			// Value taken from title input
			title: $("#titleinput").val(),
			// Value taken from note textarea
			body: $("#bodyinput").val()
		}
	})
		// With that done
		.done(function(data) {
			// Log the response
			console.log(data);
			// Empty the notes section
			$("#notes").empty();
		});

	// Also, remove the values entered in the input and textarea for note entry
	$("#titleinput").val("");
	$("#bodyinput").val("");
});

$(document).on('click', '.savearticle', function() {

});