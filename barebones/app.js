var { graphql, buildSchema } = require('graphql'); //Import graphql and schema builder

//Simple schema:
var helloSchema = buildSchema(`
  type User {
    name: String,
    age: Int
  },
  type Query {
    hello: String,
    goodbye: String,
    me: User
  }
`)

let user = {
  name: 'Robin',
  age: 21
}

var root = { //This object holds resolver functions
  hello: () => { //Fat arrow function (es6 syntax)
    return 'Hello world!' //The data, in this case a static string, but it could also be a database query.
  },
  goodbye: function() { //This is the written out version of the shorthand function above
    return 'Goodbye world!' //The data
  },
  me: function() {
    return {
      name: 'robin',
      age: 21
    }
  }
}

graphql(helloSchema, '{ hello }', root).then((response) => { //Single query
  console.log(response);
  //Response: {data: { hello: 'Hello world!'}}
});

graphql(helloSchema, '{ hello, goodbye }', root).then((response) => { //Combined query
  console.log(response);
  //Response: {data: { hello: 'Hello world!', goodbye: 'Goodbye world!'}}
});

graphql(helloSchema, '{ me {name, age} }', root).then((response) => { //Combined query
  console.log(response);
  //Response: {data: { hello: 'Hello world!', goodbye: 'Goodbye world!'}}
});
