function emailLookup(email, database) {
  for (let userId in database) {
    if (database[userId].email === email) {
      return database[userId].id;
    }
  }
  return null;
}

module.exports = emailLookup;