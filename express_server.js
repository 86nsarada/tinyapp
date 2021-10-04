const express = require("express");
const app = express();
const PORT = 8090; // default port 8080
const uuid = require('uuid');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const bcrypt = require('bcryptjs');
const findUser = require('./helpers');
//*************************************************** */
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
/************************************************************ */
const oneDay = 1000 * 60 * 60 * 34; //used it for cookie session
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123456"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
let loggedInuser = {};
let session;
//This tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

app.use(sessions({secret: "This is my session",
  saveUninitialized: true,
  cookie: {maxAge: oneDay},
  resave: false}));
//*************************************************** */
/*
app.get("/", (req, res) => {
  res.send("Hello!");
});*/
//******************************************************* */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//********************************************************* */
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//********************************************************* */
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
/********************************************************* */
app.get("/urls", (req, res) => {
  if (loggedInuser.email) {
    let filteredJson = getUserUrls(loggedInuser.id);
    console.log(filteredJson);
    const templateVars = { urls: filteredJson, username: loggedInuser.id };
    //console.log(templateVars)
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/");
  }
});
/*************************************************************/
app.post("/urls", (req, res) => {
  if (loggedInuser.email) {
    let urlName = req.body.longURL;
    //console.log(url_name)
    let randomUrlString = generateRandomString();
    let newurl = {longURL: urlName, userID: loggedInuser.id};
    urlDatabase[randomUrlString] = newurl;
  
    res.redirect("/urls");
  } else {
    res.redirect("/");
  }
});
/********************************************************* */
app.get("/urls/new", (req, res) => {
  if (loggedInuser.email) {
    const templateVars = { urls: urlDatabase, username: loggedInuser.id };
    res.render("urls_new",templateVars);
  
  } else {
    res.redirect("/");
  }
});
/********************************************************* */
app.get("/urls/:shortURL", (req, res) => {
  if (loggedInuser.email) {
    const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL, username: loggedInuser.id };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/");
  }
});
/********************************************************** */
app.get("/u/:shortURL", (req, res) => {
  if (loggedInuser.email) {
    let sortURL = req.params.shortURL;
    console.log(sortURL);
    console.log(urlDatabase);
    let longURL = urlDatabase[sortURL].longURL;
    res.redirect(longURL);
  } else {
    res.redirect("/");
  }
});

/********************************************************* */


const generateRandomString = function() {
  let result = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    result += char.charAt(Math.floor(Math.random() * char.length));
  }
  return result;
};
/************************************************************ */
//deleting URL
app.post("/urls/:shortURL/delete",(req, res)=>{
  if (loggedInuser.email) {
  //console.log(req.params.shortURL)
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/");
  }
});

/************************************************************* */
//Update URL

app.post("/urls/:id",(req,res) =>{
  
  if (loggedInuser.email) {
  //one more way to update URL
  /*if(req.query.edit){

    let shortUrl = req.params.id;
  console.log(shortUrl)
  urlDatabase[shortUrl] = req.body.newURL
  console.log(urlDatabase)
  res.redirect("/urls")
  }
  else{*/
    //console.log("Inside update Method")
    let urltoBeUpdate = req.params.id;
    let longURL = urlDatabase[urltoBeUpdate].longURL;
  
    const templateVars = { longURL: longURL,
      shortURL: urltoBeUpdate, username: loggedInuser.id };
    res.render("urls_show",templateVars);
  } else {
    res.redirect("/");
  }
/*}*/
});
/*********************************************************************** */
app.post("/urls/edit/:id",(req,res) =>{
  if (loggedInuser.email) {

    let shortUrl = req.params.id;
    
    urlDatabase[shortUrl].longURL = req.body.newURL;
    
    res.redirect("/urls");
  } else {
    res.redirect("/");
  }
  
});

/********************************************************************* */
//if user not found:

const createUser = function(email, password) {
  //const userId = generateRandomString();
  const userId = uuid.v4().substr(0,8);

  let hashedPassword = bcrypt.hashSync(password,10);
  console.log(hashedPassword);
  // adding to an object
  // objectname[key] = value
  // Create a new user
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword,
  };

  console.log(users);
  return userId;
};

/***************************************************************** */

const authenticateUser = function(email, password) {
  // retrieve the user from the db
  const userFound =  findUser(email, users);

  loggedInuser = userFound;

  console.log(loggedInuser);

  // compare the passwords
  // password match => log in
  // password dont' match => error message
  if (userFound) {
    return userFound;
  }

  return false;
};

/*************************************************************** */
//authentication user check

app.get("/register",(req, res)=>{
  
  const templateVars = {username: null};
  res.render("register",templateVars);
});

app.post("/register",(req, res)=>{
//console.log(req.body)
  const {email, password} = req.body;
  const userFound = findUser(email);
  if (userFound === false) {
    let user = createUser(req.body.email,req.body.password);
    res.redirect("/");
  //res.status(200).send("User successfully created with user Id "+ JSON.stringify(users[user].email))
  } else {
  //console.log("user found", userFound)
  //if userfound is true
    if (userFound) {
      return res.status(400).send("sorry, the user already exits");
    }
  }

});

/**************************************************************** */

app.get('/', (req, res) => {
  // if we here, we take for granted that the user is not logged in.
  const templateVars = { username: null ,message: null};

  res.render('login', templateVars);
});

/********************************************************************/

app.post('/login', (req, res) => {
  // extract the email and password from the body of request => req.body

  const email = req.body.email;
  const password = req.body.password;


  // compare the passwords
  // password match => log in
  // password dont' match => error message

  const user = authenticateUser(email, password);
  console.log(user);
  //console.log(user)
  if (user) {

    let comparePassword = bcrypt.compareSync(password,user.password);
    if (user.email === email && comparePassword === true) {
    // user is authenticated
    // setting the cookie
      res.cookie('user_id',user.id);
      session = req.session;
      session.userId = user.id;

      // redirect to /urls
      res.redirect('/urls'); //=> hey browser, can you do another request => get /urls
    } else {

      let templateVars = {username: null,message : "Wrong credentials entered. Please correct them"};
      res.render("login",templateVars);
    }
  } else {
    //res.status(401).send('User Not Registered');
    res.redirect("/register");
  }

  // user is not authenticated => send error

  
});




//*********************************************************************** */

app.post("/logout", (req, res) => {
  req.session = null;
  loggedInuser = {};
  res.redirect('/');
});

const getUserUrls = (userId) =>{

  let filterJson = {};
  for (let urlObj in urlDatabase) {
    console.log(urlDatabase);
    
    if (urlDatabase[urlObj].userID === userId) {
      filterJson[urlObj] = urlDatabase[urlObj];
    }
  }
  return filterJson;
};

