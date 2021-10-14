const express = require("express");
const app = express();
const PORT = 8090; // default port 8080
const uuid = require("uuid");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const bcrypt = require("bcryptjs");
const {
  findUserByEmail,
  passwordEncrypt,
  authenticateUser,
  getUserUrls,
  createUser,
  generateRandomString,
  users,
  urlDatabase,
} = require("./helpers");
const validUrl = require("valid-url");
//*************************************************** */
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
/************************************************************ */
const oneDay = 1000 * 60 * 60 * 34; //used it for cookie session

let loggedInuser = {};
var session;
//This tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

app.use(
  sessions({
    secret: "This is my session",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

passwordEncrypt(users);

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
  session = req.session;
  if (session.email) {
    let filteredJson = getUserUrls(session.userId);

    session = req.session;
    const templateVars = {
      urls: filteredJson,
      username: session.email,
      message: null,
    };

    res.render("urls_index", templateVars);
  } else {
    res.redirect("/");
  }
});
/*************************************************************/
app.post("/urls", (req, res) => {
  session = req.session;
  if (session.email) {
    let urlName = req.body.longURL;

    let randomUrlString = generateRandomString();
    let newurl = { longURL: urlName, userID: session.userId };
    urlDatabase[randomUrlString] = newurl;

    res.redirect("/urls");
  } else {
    res.redirect("/");
  }
});
/********************************************************* */
app.get("/urls/new", (req, res) => {
  session = req.session;
  if (session.email) {
    const templateVars = {
      urls: urlDatabase,
      username: session.email,
      message: null,
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/");
  }
});
/********************************************************* */
app.get("/urls/:shortURL", (req, res) => {
  session = req.session;
  if (session.email) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: req.params.longURL,
      username: session.userId,
      message: null,
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/");
  }
});
/********************************************************** */
app.get("/u/:shortURL", (req, res) => {
  session = req.session;
  if (session.email) {
    let sortURL = req.params.shortURL;

    let userURI = urlDatabase[sortURL];

    if (userURI.userID === session.userId) {
      let usrltoRedirect = urlDatabase[sortURL].longURL;

      if (validUrl.isUri(usrltoRedirect)) {
        res.redirect(usrltoRedirect);
      } else {
        let filteredJson = getUserUrls(session.userId);

        session = req.session;
        const templateVars = {
          urls: filteredJson,
          username: session.email,
          message: "URL trying to access is not reachable",
        };
        res.render("urls_index", templateVars);
      }
    } else {
      let filteredJson = getUserUrls(session.userId);

      session = req.session;
      const templateVars = {
        urls: filteredJson,
        username: session.email,
        message: "URL trying to access is not related to the login user",
      };
      res.render("urls_index", templateVars);
    }
  } else {
    res.redirect("/");
  }
});

/********************************************************* */

/************************************************************ */
//deleting URL
app.post("/urls/:shortURL/delete", (req, res) => {
  session = req.session;
  if (session.email) {
    let usersUri = urlDatabase[req.params.shortURL];
    if (usersUri.userID === session.userId) {
      delete urlDatabase[req.params.shortURL];
    } else {
      let filteredJson = getUserUrls(session.userId);

      session = req.session;
      const templateVars = {
        urls: filteredJson,
        username: session.email,
        message: "URL trying to delete is not belongs to login User",
      };
      res.render("urls_index", templateVars);
    }

    res.redirect("/urls");
  } else {
    res.redirect("/");
  }
});

/************************************************************* */
//Update URL

app.post("/urls/:id", (req, res) => {
  session = req.session;

  if (session.email) {
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

    let userUri = urlDatabase[urltoBeUpdate];
    if (userUri.userID === session.userId) {
      let longURL = urlDatabase[urltoBeUpdate].longURL;

      const templateVars = {
        longURL: longURL,
        shortURL: urltoBeUpdate,
        username: session.userId,
        message: null,
      };
      res.render("urls_show", templateVars);
    } else {
      let filteredJson = getUserUrls(session.userId);

      session = req.session;
      const templateVars = {
        urls: filteredJson,
        username: session.email,
        message: "URL trying to update is not belongs to login User",
      };
      res.render("urls_index", templateVars);
    }
  } else {
    res.redirect("/");
  }
  /*}*/
});
/*********************************************************************** */
app.post("/urls/edit/:id", (req, res) => {
  session = req.session;
  if (session.email) {
    let shortUrl = req.params.id;

    urlDatabase[shortUrl].longURL = req.body.newURL;

    res.redirect("/urls");
  } else {
    res.redirect("/");
  }
});

/********************************************************************* */

/*************************************************************** */

app.get("/register", (req, res) => {
  const templateVars = { username: null, message: null };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const userFound = findUserByEmail(req.body.email, users);
  if (req.body.email !== userFound.email) {
    let user = createUser(req.body.email, req.body.password);

    const reguser = authenticateUser(req.body.email, req.body.password, req);
    if (reguser) {
      let comparePassword = bcrypt.compareSync(password, reguser.password);

      if (reguser.email === req.body.email && comparePassword === true) {
        // user is authenticated
        // setting the cookie
        res.cookie("user_id", reguser.email);
        session = req.session;
        session.userId = user.email;

        // redirect to /urls
        res.redirect("/urls"); //=> hey browser, can you do another request => get /urls
      } else {
        let templateVars = {
          username: null,
          message: "Wrong credentials entered. Please correct them",
        };
        res.render("login", templateVars);
      }
    }
    //res.status(200).send("User successfully created with user Id "+ JSON.stringify(users[user].email))
  } else {
    //if userfound is true
    if (userFound) {
      let templateVars = {
        username: null,
        message: "User already exists. Please enter different username",
      };
      res.render("register", templateVars);
    }
  }
});

/**************************************************************** */

app.get("/", (req, res) => {
  // if we here, we take for granted that the user is not logged in.
  const templateVars = { username: null, message: null };

  res.render("login", templateVars);
});

/********************************************************************/

app.post("/login", (req, res) => {
  // extract the email and password from the body of request => req.body

  const email = req.body.email;
  const password = req.body.password;

  // compare the passwords
  // password match => log in
  // password dont' match => error message

  const user = authenticateUser(email, password, req);

  //console.log(user)
  if (user && user !== "Not Found") {
    let comparePassword = bcrypt.compareSync(password, user.password);
    if (user.email === email && comparePassword === true) {
      // user is authenticated
      // setting the cookie
      res.cookie("user_id", user.id);
      session = req.session;
      session.userId = user.id;

      // redirect to /urls
      res.redirect("/urls"); //=> hey browser, can you do another request => get /urls
    } else {
      let templateVars = {
        username: null,
        message: "Wrong credentials entered. Please correct them",
      };
      res.render("login", templateVars);
    }
  } else {
    //res.status(401).send('User Not Registered');
    if (user === "Not Found") {
      let templateVars = {
        username: null,
        message: `User with user email ${email} not found in the database. Please register`,
      };
      res.render("register", templateVars);
    }
  }

  // user is not authenticated => send error
});

//*********************************************************************** */

app.post("/logout", (req, res) => {
  req.session.destroy();
  loggedInuser = {};
  res.redirect("/");
});
