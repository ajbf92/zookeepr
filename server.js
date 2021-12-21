// need fs to be able to write files into the JSON file 
const fs = require('fs');
// path is used to help with files and directory paths
const path = require('path');
const express = require('express');
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
const { animals } = require('./data/animal.json');

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
        // Save personalityTraits as a dedicated array.
        // If personalityTraits is a string, place it into a new array and save.
        if (typeof query.personalityTraits === 'string') {
          personalityTraitsArray = [query.personalityTraits];
        } else {
          personalityTraitsArray = query.personalityTraits;
        }
        // Loop through each trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
          // Check the trait against each animal in the filteredResults array.
          // Remember, it is initially a copy of the animalsArray,
          // but here we're updating it for each trait in the .forEach() loop.
          // For each trait being targeted by the filter, the filteredResults
          // array will then contain only the entries that contain the trait,
          // so at the end we'll have an array of animals that have every one 
          // of the traits when the .forEach() loop is finished.
          filteredResults = filteredResults.filter(
            animal => animal.personalityTraits.indexOf(trait) !== -1
          );
        });
      }
  if (query.diet) {
    filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
  }
  if (query.species) {
    filteredResults = filteredResults.filter(animal => animal.species === query.species);
  }
  if (query.name) {
    filteredResults = filteredResults.filter(animal => animal.name === query.name);
  }
  return filteredResults;
}

function findById (id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

function createNewAnimal(body, animalsArray) {
    // console.log(body);
// our funciton's main code will go here
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
        // null and 2, are means of keeping our data formatted.
        // The null argument means we don't want to edit any of our existing data;
        // The 2 indicates we want to create white space between our values to make it more readable.
    );
// return finished code to post route for response
    return animal;
}

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
      return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
      return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
      return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
      return false;
    }
    return true;
  }

app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    // console.log(req.query)
    res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result);
    } else {
        res.sendStatus(404);
    }
});

app.post('/api/animals', (req, res) => {
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

     // if any data in req.body is incorrect, send 400 error back. 400 error. This indicates to the user that our server doesn't have any problems and we can understand their request, but they incorrectly made the request and we can't allow it to work.
  if (!validateAnimal(req.body)) {
    res.status(400).send('The animal is not properly formatted.');
  } else {
    // add animal to json file and animals array in this function
    const animal = createNewAnimal(req.body, animals);
    res.json(animal);
  }
});
// route that connects homepage with server
// respond with an HTML page to display in the browser. So instead of using res.json(), we're using res.sendFile()
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});
// route that connects animals page with server
app.get('/animals', (req,res) => {
  res.sendFile(path.join(__dirname, './public/animals.html'));
});
// route that connects zookeepers page with server
app.get('/zookeepers', (req, res) => {
  res.sendFile(path.join(__dirname, './public/zookeepers.html'));
});
// wildcard route; and it should always come last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(PORT, () => {
    console.log('API server now on port ${PORT}!');
});