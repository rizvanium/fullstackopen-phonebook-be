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

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

app.get('/api/info', (req, res) => {
  const requestTime = new Date();
  const peopleCount = persons ? persons.length : 0;
  res.send(`<p>Phonebook has info about ${peopleCount} people</p>
            <p>${requestTime}</p>`);
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  })
})

app.get('/api/persons/:id', (req, res) => {
  const id = +req.params.id;

  const requestedPerson = persons.find(person => person.id === id);
  if (!requestedPerson) {
    res.status(404).end();
  }

  res.json(requestedPerson);
})

app.post('/api/persons', (req, res) => {
  const {name, number} = req.body;

  if (!name || !number) {
    return res.status(400).json({
      error: 'name and number properties must be set',
    });
  }

  if (persons.find(p => p.name === name)) {
    return res.status(400).json({
      error: 'name must be unique',
    });
  }

  const newPerson = {
    id: getId(persons),
    name: name,
    number: number
  };

  persons = [...persons, newPerson];
  res.status(201).json(newPerson);
})

app.delete('/api/persons/:id', (req, res) => {
  const id = +req.params.id;
  const requestedPerson = persons.find(person => person.id === id);

  if (!requestedPerson) {
    res.status(404).end();
  }

  persons = persons.filter(person => person.id !== id);
  
  res.status(204).end();
})

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server is listening on port: ${PORT}`);
})

function getId(persons) {
  if (persons.length === 0) return 0;
  return getRandomInt(0, Number.MAX_SAFE_INTEGER);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}