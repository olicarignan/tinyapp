const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

// const users = {
//   admin : {
//     username : admin,
//     password : 1234
//   }
// };


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const toDelete = req.params.shortURL;
  res.redirect("/urls");
  delete urlDatabase[toDelete];
})

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
})

app.post("/urls/:shortURL/update", (req, res) => {
  const shorturl = req.params.shortURL;
  urlDatabase[shorturl] = req.body.longURL;
  res.redirect("/urls");
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = { username: req.cookies["username"], shortURL: shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies['username'], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( let i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};