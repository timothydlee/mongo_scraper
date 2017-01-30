### MONGO NEWS SCRAPER

A full stack application utilizing MongoDB as the backend, the Node environment, Express to handle server and routing setup and Handlebars as the View Engine.

[https://mongo-news-scraper.herokuapp.com](https://mongo-news-scraper.herokuapp.com)

### TO SETUP

- Set MongoDB up. You can find instructions here: [https://www.mongodb.com/](https://www.mongodb.com).

- Open the file server.js in your IDE. Navigate to "mongoose.connect" on line 19 and uncomment line 19. 

- Comment out line 22. Save.

- After set up, enter the following command in the terminal/bash:

	mongod

- When connection is up and running, open a second bash/terminal window and navigate to the root directory. Enter commands:

	-npm i
	-nodemon server.js

- The app should be running on localhost:3000.