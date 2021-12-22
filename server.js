const express = require('express');

const apiRoutes = require('./routes/apiRoutes');
const htmlRoutes = require('./routes/htmlRoutes');

// When Heroku runs our app, it sets an environment variable called process.env.PORT. We're going to tell
// our app to use that port, if it has been set, and if not, default to port 80.
const PORT = process.env.PORT || 3001;
const app = express();
// parse incoming string or array data

// The express.urlencoded({extended: true}) method is a method built into Express.js. It takes incoming POST
// data and converts it to key/value pairings that can be accessed in the req.body object. 

// The extended: true option set inside the method call informs our server that there may be sub-array data
// nested in it as well, so it needs to look as deep into the POST data as possible to parse all of the data correctly.
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
// takes incoming POST data in the form of JSON and parses it into the req.body JavaScript object.
app.use(express.json());
// Both of the above middleware functions need to be set up every time you create a server that's looking 
// to accept POST data.
// We added some more middleware to our server and used the express.static() method. The way it works is
// that we provide a file path to a location in our application (in this case, the public folder) and 
// instruct the server to make these files static resources. This means that all of our front-end code can
// now be accessed without having a specific server endpoint created for it!
app.use(express.static('public'));

app.use('/api', apiRoutes);
app.use('/', htmlRoutes);
// This is our way of telling the server that any time a client navigates to <ourhost>/api, the app will
// use the router we set up in apiRoutes. If / is the endpoint, then the router will serve back our HTML
// routes.

app.listen(PORT, () => {
    console.log('API server now on port ${PORT}!');
});