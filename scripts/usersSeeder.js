var models = require('../models/schemas');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/pickyeater');

// CREATE USERS

var user1 = {
    email: "user1@email.com",
    password: "password"

}

var user2 = {
    email: "user2@email.com",
    password: "password"
}

function createUser(newUser) {
    console.log("createUser fired");
    models.User.findOne({
        email: newUser.email
    }, function(err, user) {
        console.log("err: ", err);
        console.log("user: ", user);
        if (!user) {
            console.log("going to create new user");
            models.User.create({
                    email: newUser.email,
                    password: newUser.password,
                    preferences: {
                        userEmail: newUser.email,
                        diet: [],
                        health: [],
                        blogs: []
                    },
                    saved: []
                },
                function(err, created) {
                    console.log("created user: ", created);
                }
            )
        } else {
            console.log("user found: ", user);
        }
    })
}

createUser(user1);
createUser(user2);
