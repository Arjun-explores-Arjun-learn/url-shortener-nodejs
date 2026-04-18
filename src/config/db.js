const mongoose = require('mongoose');

function connectToMongoDB(uri) {
  return mongoose.connect(uri);
}

module.exports = {
  connectToMongoDB,
};

