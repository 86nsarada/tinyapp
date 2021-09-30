const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const uuid = require('uuid/v4');
const cookieParser = require('cookie-parser');

// Declared objects: url and user databases to be used in routes and functions
const urlDataBase = {
  b2xVn2: {
    id: 'userRandomID',
    url: 'http://www.lighthouselabs.ca',
    visits: 0
  },
  P80OsK: {
    id: 'userRandomID',
    url: 'https://github.com',
    visits: 0
  },
  s9m5xK: {
    id: 'user2RandomID',
    url: 'http://www.google.com',
    visits: 0
  },
  oSLt22: {
    id: 'user2RandomID',
    url: 'https://developer.mozilla.org',
    visits: 0
  }
};

const usersDb = { 
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

app.set("view engine", "ejs");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const generateRandomString = function(){
    let result = '';
    const char='ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for(let i=0; i< 6; i++){
        result += char.charAt(Math.floor(Math.random()*char.length));
    }
    return result;
}


app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>new World</b></body></html>\n");
  });

  app.get("/", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });
//..............................................................  

  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL        };
    res.render("urls_show", templateVars);
  });
//..................................................................


  app.get('/login', (req, res) => {
    // if we here, we take for granted that the user is not logged in.
    const templateVars = { user: null };
  
    res.render('login', templateVars);
  });

  app.post('/login', (req, res) => {
    // extract the email and password from the body of request => req.body
  
    const email = req.body.email;
    const password = req.body.password;
  
  
    // compare the passwords
    // password match => log in
    // password dont' match => error message
  
    const user = authenticateUser(email, password, usersDb);
  
    if (user) {
      // user is authenticated
      // setting the cookie
      res.cookie('user_id', user.id);
  
      // redirect to /quotes
      res.redirect('/urls'); //=> hey browser, can you do another request => get /quotes
      return;
    }
  
    // user is not authenticated => send error
  
    res.status(401).send('Wrong credentials!');
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  //..........................................................................
//   const bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({extended: true}));

app.post("/urls", (req, res) => {
    console.log(req.body);  // Log the POST request body to the console
    res.send("Ok");         // Respond with 'Ok' (we will replace this)
const shortURL = generateRandomString();
const longURL = req.body.longURL;
res.redirect('/urls/'+shortURL) 
});

//   app.get("/u/:shortURL", (req, res) => {
//     const longURL={longURL: req.params.longURL }
//     res.redirect(longURL);
//   });
// app.get("/delete",(req, res) =>{
// res.redirect("/urls/9sm5xK/delete")
// })
//   app.post("/urls/9sm5xK/delete", (req, res) => {
//     console.log(req.body); 
//     delete urlDatabase["9sm5xK"] 
//     res.json(urlDatabase)      
//        // Respond with 'Ok' (we will replace this)
//   });
app.post('/urls/:shortURL/delete',(req, res)=>{
    if(urlDatabase[req.params.shortURL]){
        delete urlDatabase[req.params.shortURL];
        res.redirect('/urls');
    }
})

  app.post("/urls/:shortURL/edit",(req, res)=> {
      console.log(req.body.shortURL);
      if(urlDatabase[req.params.shortURL]){
        res.redirect('/urls')
        res.send("record id updated") 
      }
      //res.send("record id updated")
  })

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });