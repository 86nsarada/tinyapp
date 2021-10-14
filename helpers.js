/******************************************************************** */

//finding user by email: Authentication helper function

const bcrypt = require("bcryptjs");

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123456",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123456",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const findUserByEmail = function (email, users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }
  return false;
};

const passwordEncrypt = (users) => {
  for (let usr in users) {
    const user = users[usr];
    let hashedPassword = bcrypt.hashSync(user.password, 10);

    users[usr] = {
      id: user.id,
      email: user.email,
      password: hashedPassword,
    };
  }
};

const authenticateUser = function (email, password, req) {
  // retrieve the user from the db
  const userFound = findUserByEmail(email, users);

  if (userFound) {
    session = req.session;
    session.userId = userFound.id;
    session.email = userFound.email;
    return userFound;
  } else {
    return "Not Found";
  }
};

const getUserUrls = (userId) => {
  let filterJson = {};
  for (let urlObj in urlDatabase) {
    if (urlDatabase[urlObj].userID === userId) {
      filterJson[urlObj] = urlDatabase[urlObj];
    }
  }
  return filterJson;
};

const createUser = function (email, password) {
  //const userId = generateRandomString();
  const userId = uuid.v4().substr(0, 8);

  let hashedPassword = bcrypt.hashSync(password, 10);

  // adding to an object
  // objectname[key] = value
  // Create a new user
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword,
  };

  return userId;
};

const generateRandomString = function () {
  let result = "";
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    result += char.charAt(Math.floor(Math.random() * char.length));
  }
  return result;
};
module.exports = {
  findUserByEmail,
  passwordEncrypt,
  authenticateUser,
  getUserUrls,
  createUser,
  generateRandomString,
  users,
  urlDatabase,
};
