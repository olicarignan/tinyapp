const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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
}


const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID:"user2RandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID:"user2RandomID"}
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  if (!req.cookies['user_id']){
    res.redirect('/register'); 
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {longURL: req.body.longURL, userID: userID}; 
    res.redirect(`/urls/${shortURL}`); 
  } 
});


app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  let templateVars = { user: users[userId], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const toDelete = req.params.shortURL;
  res.redirect("/urls");
  delete urlDatabase[toDelete];
})

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  const userId = emailLookup(email);
  if (userId) {
      if(password === users[userId].password) {
      res.cookie('user_id', userId);
      res.redirect("/urls");
    } else {
      res.sendStatus(403);
    }
    res.sendStatus(403);
  }
})

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.sendStatus(400);
  } else if (emailLookup(email) !== null) {
    res.sendStatus(400);
  } else {
  const id = Math.floor(Math.random() * 1000);
  users[id] = { id, email, password };
  res.cookie('user_id', id)
  res.redirect("/urls"); 
}
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
})

app.post("/urls/:shortURL/update", (req, res) => {
  const shorturl = req.params.shortURL;
  urlDatabase[shorturl] = req.body.longURL;
  res.redirect("/urls");
})

app.get("/login", (req, res) => {
  const userId = req.cookies['user_id'];
  let templateVars = { user: users[userId], urls: urlDatabase };
  res.render("login", templateVars);
})

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
  const userId = req.cookies['user_id']
  let templateVars = { user: users[userId], shortURL: shortURL, longURL: urlDatabase[shortURL].longURL };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars;
  let newURLs = {};
  const userId = req.cookies['user_id']
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
  const userId = req.cookies['user_id'];
  let templateVars = { user: users[userId], urls: urlDatabase };
  res.render("registration", templateVars);
})

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

function emailLookup(email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId].id;
    }
  }
  return null;
}