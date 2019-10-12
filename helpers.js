//get users by email
const emailLookup = function(email, database) {
  for (let userId in database) {
    if (database[userId].email === email) {
      return database[userId].id;
    }
  }
  return null;
};

const userVerifiication = function(database, userId) {
  let result = {};
  for (let element in database) {
    if (database[element].userID === userId) {
      result[element] = database[element];
    }
  }
  return result;
}

module.exports = { emailLookup, userVerifiication };