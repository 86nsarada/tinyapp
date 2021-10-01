const express = require("express");
const app = express();
const PORT = 8090; // default port 8080
const uuid = require('uuid')
const cookieParser = require('cookie-parser');
//*************************************************** */
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
/************************************************************ */

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//This tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//*************************************************** */
app.get("/", (req, res) => {
  res.send("Hello!");
});
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
  const templateVars = { urls: urlDatabase, username: "sarada" };
  res.render("urls_index", templateVars);
});
/*************************************************************/
app.post("/urls", (req, res) => {
  let url_name= req.body.longURL;
  console.log(url_name)
  let randomUrlString = generateRandomString();
  urlDatabase[randomUrlString] = url_name;
  res.redirect("/urls")
});
/********************************************************* */
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: "sarada" };
  res.render("urls_new",templateVars);
});
/********************************************************* */
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL, username: "sarada" };
  res.render("urls_show", templateVars);
});
/********************************************************** */
app.get("/u/:shortURL", (req, res) => {
  let sortURL = req.params.shortURL;
  console.log(sortURL)
   let longURL = urlDatabase[sortURL]
    res.redirect(longURL)
});

/********************************************************* */


const generateRandomString = function(){
  let result = '';
  const char='ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for(let i=0; i< 6; i++){
      result += char.charAt(Math.floor(Math.random()* char.length));
  }
  return result;  
}
/************************************************************ */
//deleting URL
app.post("/urls/:shortURL/delete",(req, res)=>{
  console.log(req.params.shortURL)
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
})

/************************************************************* */
//Update URL

app.post("/urls/:id",(req,res) =>{
  

  /*if(req.query.edit){

    let shortUrl = req.params.id;
  console.log(shortUrl)
  urlDatabase[shortUrl] = req.body.newURL
  console.log(urlDatabase)
  res.redirect("/urls")
  }
  else{*/
  console.log("Inside update Method")
  let urltoBeUpdate = req.params.id;
  let longURL = urlDatabase[urltoBeUpdate]
  
  const templateVars = { longURL: longURL, 
    shortURL: urltoBeUpdate, username: "sarada" };
  res.render("urls_show",templateVars)
/*}*/
}) 

app.post("/urls/edit/:id",(req,res) =>{
  console.log("Inside Edit ")
  

    let shortUrl = req.params.id;
  console.log(shortUrl)
  urlDatabase[shortUrl] = req.body.newURL
  console.log(urlDatabase)
  res.redirect("/urls")
  
  
})

//finding user by email: Authentication helper function

const findUserByEmail=function(email, users){
  for(let userId in users){
    const user = users[userId]
    if(email === user.email){
      return user;
    }
  }
  return false;
}

//if user not found:

const createUser = function ( email, password) {
  //const userId = generateRandomString();
  const userId = uuid.v4().substr(0,8);

  // adding to an object
  // objectname[key] = value
  // Create a new user
  users[userId] = {
    id: userId,
    email,
    password,
  };

  return userId;
};


const authenticateUser = function (email, password) {
  // retrieve the user from the db
  const userFound = findUserByEmail(email, users);

  // compare the passwords
  // password match => log in
  // password dont' match => error message
  if (userFound && userFound.password === password) {
    return userFound;
  }

  return false;
};

/*************************************************************** */
//authentication user check

app.get("/register",(req, res)=>{
  
  const templateVars ={username: null}
  res.render("register",templateVars)
})

app.post("/register",(req, res)=>{
console.log(req.body)
const {email, password} = req.body
const userFound = findUserByEmail(email)
if(userFound === false){
  let user = createUser(req.body.email,req.body.password)
  
  res.status(200).send("User successfully created with user Id "+ JSON.stringify(users[user].email))
}
else{
  console.log("user found", userFound)
  //if userfound is true
  if(userFound){
    return res.status(400).send("sorry, the user already exits")
  }
}

});

/**************************************************************** */

app.get('/login', (req, res) => {
  // if we here, we take for granted that the user is not logged in.
  const templateVars = { username: null };

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
console.log(user)
  if (user) {
    // user is authenticated
    // setting the cookie
    res.cookie('user_id', user.id);

    // redirect to /urls
    res.redirect('/urls'); //=> hey browser, can you do another request => get /urls
    return;
  }

  // user is not authenticated => send error

  res.status(401).send('Wrong credentials!');
});