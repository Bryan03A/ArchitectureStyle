const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const gql = require('graphql-tag'); // Importar gql correctamente

// Datos simulados
let users = [
    { id: '1', name: 'Alice', age: 25 },
    { id: '2', name: 'Bob', age: 30 },
    { id: '3', name: 'Charlie', age: 35 },
];

// Definir el esquema GraphQL
const typeDefs = gql`
    type User {
        id: ID!
        name: String!
        age: Int!
    }

    type Query {
        users: [User!]!
        user(id: ID!): User
    }

    type Mutation {
        addUser(name: String!, age: Int!): User!
        updateUser(id: ID!, name: String, age: Int): User
        deleteUser(id: ID!): String
    }
`;

// Definir los resolvers
const resolvers = {
    Query: {
        users: () => users,
        user: (_, { id }) => users.find(user => user.id === id),
    },
    Mutation: {
        addUser: (_, { name, age }) => {
            const newUser = { id: `${users.length + 1}`, name, age };
            users.push(newUser);
            return newUser;
        },
        updateUser: (_, { id, name, age }) => {
            const user = users.find(user => user.id === id);
            if (!user) throw new Error('User not found');
            if (name) user.name = name;
            if (age) user.age = age;
            return user;
        },
        deleteUser: (_, { id }) => {
            users = users.filter(user => user.id !== id);
            return `User with ID ${id} deleted.`;
        },
    },
};

// Crear el servidor Apollo
const server = new ApolloServer({ typeDefs, resolvers });

// Iniciar el servidor
startStandaloneServer(server, { listen: { port: 4000 } }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
