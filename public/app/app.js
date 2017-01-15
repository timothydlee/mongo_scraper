function showSavedArticles() {
	let homeJumbo = document.querySelector('.home-jumbotron');
	let savedJumbo = document.querySelector('.saved-articles-jumbotron');
	homeJumbo.classList.add('hidden');
	savedJumbo.classList.remove('hidden');
};

let articlesButton = document.querySelector('.saved-articles-button');
articlesButton.addEventListener('click', showSavedArticles);

$("#home-button").on('click', function() {
	let homeJumbo = document.querySelector('.home-jumbotron');
	let savedJumbo = document.querySelector('.saved-articles-jumbotron');
	homeJumbo.classList.remove('hidden');
	savedJumbo.classList.add('hidden');
});

// //Grabbing articles from MongoDB BSON as JSON
// $.getJSON('/articles', (data) => {
// 	//Response data array is mapped
// 	data.map((article) => {
// 		//Assigning article.title, article.img...
// 		let { title, img, link, desc } = article;
		
// 		//Appending each article to the DOM
// 		$("#articles").append(`<h2>${title}</h2> 
// 			<p>${img}</p> 
// 			<p>${desc}</p> 
// 			<button type='button' class='btn btn-primary' id="article_link"><a target='_blank' href='http://${link}'>Link to the article</a></button>
// 			<button type="button" class="btn btn-success">Click to Save Article</button>
// 			<br><br>`)
// 		//Dynamically generate Save Article buttons
// 		// $('#articles').append('<button>Click To Save Article!');
// 	});
// });


// $(document).on('click', '#scrape-button', () => {
// 	fetch('/scrape')
// 		.then(blob => blob.json())
// 		.then(data => console.log(data));
// });

$(document).on("click", "#scrape-button", () => {
	
	$.get({ url: '/scrape'}).done(function(data) {
		console.log(data.length);
		$("#scraped-modal-text").html(`<h3>${data.length}</h3>`)
	});
	//Grabbing articles from MongoDB BSON as JSON
	$.getJSON('/articles', (data) => {
		$("#scraped-modal-text").html("<h3>" + data.length + "</h3>")

		//Response data array is mapped
		data.map((article) => {
			//Assigning article.title, article.img...
			let { title, img, link, desc } = article;
			
			//Appending each article to the DOM
			$("#articles").append(`<h2>${title}</h2> 
				<p>${img}</p> 
				<p>${desc}</p> 
				<button type='button' class='btn btn-primary' id="article_link"><a target='_blank' href='http://${link}'>Link to the article</a></button>
				<button type="button" class="btn btn-success">Click to Save Article</button>
				<br><br>`);
				
		});
	});
});



// // Grab the articles as a json
// $.getJSON("/articles", function(data) {
//   // For each one
//   for (var i = 0; i < data.length; i++) {
//     // Display the apropos information on the page
//     $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
//   }
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

