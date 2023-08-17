const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const uri = process.env.MONGODB_URI;

console.log('connecting to mongo');

mongoose.connect(uri)
  .then(() => {
    console.log('connected to mongo');
  })
  .catch(error => {
    console.log('failed to connect to mongo:', error.message);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject._v;
  }
});

module.exports = mongoose.model('Person', personSchema);