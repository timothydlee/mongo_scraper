function showSavedArticles() {
	let homeJumbo = document.querySelector('.home-jumbotron');
	let savedJumbo = document.querySelector('.saved-articles-jumbotron');
	homeJumbo.classList.add('hidden');
	savedJumbo.classList.remove('hidden');
}

let articlesButton = document.querySelector('.saved-articles-button');
articlesButton.addEventListener('click', showSavedArticles);

$("#home-button").on('click', function() {
	let homeJumbo = document.querySelector('.home-jumbotron');
	let savedJumbo = document.querySelector('.saved-articles-jumbotron');
	homeJumbo.classList.remove('hidden');
	savedJumbo.classList.add('hidden');
})
