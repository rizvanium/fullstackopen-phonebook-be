const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const uri = process.env.MONGODB_URI

console.log('connecting to mongo')

mongoose.connect(uri)
  .then(() => {
    console.log('connected to mongo')
  })
  .catch(error => {
    console.log('failed to connect to mongo:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
  },
  number: {
    type: String,
    required: true,
    minLength: 8,
    validate: {
      validator: function(v) {
        return /^\d{2,3}-\d{4,}/g.test(v)
      },
      message: props => `phone number ${props.value} is invalid`
    },
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)