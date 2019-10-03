const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');
const emailLookup = require('./helpers.js');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['badoadoanfakjadodn']
}));

app.set("view engine", "ejs");

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
};


const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID:"user2RandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID:"user2RandomID"}
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  const userID = req.session['user_id'];
  if (!req.cookies['user_id']) {
    res.redirect('/register');
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {longURL: req.body.longURL, userID: userID};
    res.redirect(`/urls/${shortURL}`);
  }
});


app.get("/urls/new", (req, res) => {
  const userId = req.session['user_id'];
  let templateVars = { user: users[userId], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const toDelete = req.params.shortURL;
  res.redirect("/urls");
  delete urlDatabase[toDelete];
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  const userId = emailLookup(email);
  if (userId) {
    if (bcrypt.compareSync(password, users[userId].password)) {
      res.session['user_id'] = userId;
      res.redirect("/urls");
    } else {
      res.sendStatus(403);
    }
    res.sendStatus(403);
  }
});

app.post("/register", (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    res.sendStatus(400);
  } else if (emailLookup(email, users) !== null) {
    res.sendStatus(400);
  } else {
    const id = Math.floor(Math.random() * 1000);
    password = bcrypt.hashSync(password, 10);
    users[id] = { id, email, password };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.redirect("/urls");
  delete req.session.user_id;
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shorturl = req.params.shortURL;
  urlDatabase[shorturl] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userId = req.session['user_id'];
  let templateVars = { user: users[userId], urls: urlDatabase };
  res.render("login", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const userId = req.session['user_id'];
  let templateVars = { user: users[userId], shortURL: shortURL, longURL: urlDatabase[shortURL].longURL };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars;
  let newURLs = {};
  const userId = req.session['user_id'];
  if (userId) {
    for (let url in urlDatabase) {
      if (urlDatabase[url].userID === userId) {
        newURLs[url] = {longURL: urlDatabase[url].longURL, shortURL: url};
      }
    }
    templateVars = { user: users[userId], urls: newURLs };
  } else {
    templateVars = { user: users[userId], urls: urlDatabase };
  }
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.session['user_id'];
  let templateVars = { user: users[userId], urls: urlDatabase };
  res.render("registration", templateVars);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

const generateRandomString = function() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

