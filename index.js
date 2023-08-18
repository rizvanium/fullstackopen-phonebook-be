require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors  = require('cors');
const Person = require('./models/person');

const app = express();

morgan.token('body', (req, res) => {
  const stringBody = JSON.stringify(req.body)
  return stringBody === '{}' ? ' ' : stringBody;
});

app.use(express.static('dist'))
app.use(cors());
app.use(express.json());
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"));

app.get('/api/info', (req, res) => {
  Person.find({})
    .then(persons => {
      const peopleCount = persons ? persons.length : 0;
      res.send(`<p>Phonebook has info about ${peopleCount} people</p>
      <p>${new Date()}</p>`);
    });
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  })
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({
      error: 'name and number properties must be set',
    });
  }

  const person = new Person({ name, number });

  person.save()
    .then(response => res.status(201).json(response))
    .catch(error => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body;

  const person = { name, number };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson);
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(error => next(error));
});

const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }

  res.status(500).end();
}

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server is listening on port: ${PORT}`);
});