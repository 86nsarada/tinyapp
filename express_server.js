const express = require("express");
const app = express();
const PORT = 8090; // default port 8080
//*************************************************** */
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
/************************************************************ */

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

/*app.post("/urls/:id",(req,res) =>{
  console.log(req.query._method)
  if(req.query.edit){

    let shortUrl = req.params.id;
  console.log(shortUrl)
  urlDatabase[shortUrl] = req.body.newURL
  console.log(urlDatabase)
  res.redirect("/urls")
  }
  else{
  console.log("Inside update Method")
  let urltoBeUpdate = req.params.id;
  let longURL = urlDatabase[urltoBeUpdate]
  
  const templateVars = { longURL: longURL, 
    shortURL: urltoBeUpdate, username: "sarada" };
  res.render("urls_show",templateVars)
}
}) */

app.post("/urls/edit/:id",(req,res) =>{
  console.log("Inside Edit ")
  

    let shortUrl = req.params.id;
  console.log(shortUrl)
  urlDatabase[shortUrl] = req.body.newURL
  console.log(urlDatabase)
  res.redirect("/urls")
  
  
})

/*************************************************************** */