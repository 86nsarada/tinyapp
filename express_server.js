const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function(){
    let result = '';
    const char='ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for(let i=0; i< 6; i++){
        result += char.charAt(Math.floor(Math.random()*char.length));
    }
    return result;
}


app.get("/", (req, res) => {
  res.send("Hello world!");
});

// app.listen(PORT, () => {
//   console.log(`Example app listening on port ${PORT}!`);
// });

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

  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL        };
    res.render("urls_show", templateVars);
  });

  app.get("/login",(req, res)=> {
      res.render(login)
  })

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

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

  app.post("/urls/shortURL/edit",(req, res)=> {
      //console.log(req.body.b2xVn2);
      if(urlDatabase[req.params.shortURL]){
        res.redirect('/urls')
        res.send("record id updated") 
      }
      //res.send("record id updated")
  })

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });