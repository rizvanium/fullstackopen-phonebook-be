
const ActionCode = {
  GET_ALL: 0,
  ADD_NEW: 1,
  END_PROCESS: 2
};

class Action {
  constructor(code, run) {
    this.code = code;
    this.run = run;
  }
}

const action = getAction(process.argv);
action.run();

function addNewPerson(name, number) {
  const mongoose = setupMongoose(process.argv);
  const Person = getPersonModel(mongoose);
  const newPerson = new Person({ name, number });

  newPerson.save()
    .then((result) => {
      console.log(`|\tadded ${result.name} ${result.number} to phonebook`);
    })
    .catch(() => {
      console.log('|\tfailed to add new person');
    })
    .finally(() => {
      console.log('closing db connection...');
      mongoose.connection.close()
        .then(() => console.log('connection closed'))
        .catch(() => console.log('connection failed to close'));
    });
}

function getAllPersons() {
  const mongoose = setupMongoose(process.argv);
  const Person = getPersonModel(mongoose);
  Person.find({})
    .then(persons => {
      console.log('|\tphonebook:');
      persons.forEach(p => {
        console.log(`|\t${p.name} ${p.number}`);
      });
    })
    .finally(() => {
      console.log('closing db connection...');
      mongoose.connection.close()
        .then(() => console.log('connection closed'))
        .catch(() => console.log('connection failed to close'));
  })
}

function getAction(args) {
  let argCount = args.length;
  switch (argCount) {
    case 3:
      return new Action(ActionCode.GET_ALL, () => getAllPersons());
    case 5:
      return new Action(ActionCode.ADD_NEW, () => addNewPerson(args[3], args[4]));
    default:
      return new Action(ActionCode.END_PROCESS, () => {
        if (argCount < 3) {
          console.log('not enough arguments, try again');
        } else {
          console.log('too many arguments, try again:');
        }
        let fileName = args[1].split('/').at(-1);
        console.log(`add new person -> node ${fileName} {mongo_password} {personName} {personNumber}`)
        console.log(`get all persons -> node ${fileName} {mongo_password}`)
        process.exit(1);
      });
  }
}

function getPersonModel(mongoose) {
  const personSchema = mongoose.Schema({
    name: String,
    number: String
  });

  return mongoose.model('Person', personSchema);
}

function setupMongoose(args) {
  const mongoose = require('mongoose')
  const password = args[2];

  const dbConnectionString =
  `mongodb+srv://rizvanas:${password}@playing-around.uydoxz7.mongodb.net/phonebook?retryWrites=true&w=majority`;

  mongoose.set('strictQuery',false)

  console.log('opening db connection...');

  mongoose
    .connect(dbConnectionString)
    .then(() => console.log('connection open:'))
    .catch(() => {
      console.log('connection failed to open\nexiting program...');
      process.exit(1);
    });

  return mongoose;
}
