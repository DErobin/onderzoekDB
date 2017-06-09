var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
var MongoClient = require('mongodb').MongoClient

const PORT = 3000
const MONGO_URL = 'mongodb://localhost:27017'



var schema = buildSchema(`
  type Query {
    hello: String
    helloMessage(msg: String): String
    giveMeRandom(msg: String) : Result
    getUser(id: Int): User
    getApparaat(id: Int): Apparaat
  }
  type Result {
    msg: String
    random: Float
  }
  type User {
    _id: Int
    name: String
    age: Int
  }
  type Apparaat {
    _id: Int
    name: String
    values: [Int]
    description: String
    ownedBy: User
  }
`);

var root = {
  hello: () => {
    return 'Hello world!'
  },
  helloMessage: ({msg}) => {
    return 'Hello:' + msg
  },
  giveMeRandom: ({msg}) => {
    let r = Math.random()
    let result = {
      msg: 'Your message:' + msg + 'R:'+ r,
      random: r
    }
    return result
  },
  getUser: ({id}) => {
    console.log('Fetching user:', id);
    return new Promise(function(resolve, reject) {
      database.collection('users').findOne({_id: id}, function(e, r) {
        if(e)
          reject(e)
        else
          resolve(r)
      })
    });
  },
  getApparaat: ({id}) => {
    console.log('Fetching apparaat:', id);
    return new Promise(function(resolve, reject) {
      let result
      database.collection('apparaat').findOne({_id: id}, function(e, r) {
        if(e)
          reject(e)
        else {
          result = r
          database.collection('users').findOne({_id: r._id}, function(e, r) {
            if(e)
              reject(e)
            else {
              result.ownedBy = r
            }
              resolve(result)
          })
        }
      })
    });
  }
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));




let database //The database object
const startServer = () => {
  MongoClient.connect(MONGO_URL, function (err, db) {
    if (err) throw err
    database = db
    console.log('MongoDB connected!');
    app.listen(PORT, () => {
        console.log('Server started @ localhost:'+PORT)
    });
    database.collection('users').remove({}, function() {
      database.collection('apparaat').remove({}, function() {
        fillWithTestData()
      })
    })
  })
}

const fillWithTestData = () => {
  for(let user of testUsers) {
    database.collection('users').insertOne(user)
  }
  for(let apparaat of testData) {
    database.collection('apparaat').insertOne(apparaat)
  }
}

try {
  startServer()
} catch(error) {
  console.log("Could not start server:", error);
}

//TEST DATA:
const testUsers = [
  {
    _id: 1,
    name: 'Robin van Dijk',
    age: 21
  },
  {
    _id: 2,
    name: 'Bertje Bertsma',
    age: 46
  }
]

const testData = [
  {
    _id: 1,
    name: 'Apparaat 1',
    values: [0, 2, 328, 17],
    description: 'Dit apparaat doet X',
    ownedBy: 1 //Owner of the device (Robin)
  },
  {
    _id: 2,
    name: 'Apparaat 2',
    values: [32, 454, 0, 1],
    description: 'Dit apparaat doet Y',
    ownedBy: 2 //Owner of the device (Bertje)
  }
]
