var express = require('express');
var router = express.Router();
var models = require('../models/schemas');
var mongoose = require('mongoose');
var request = require('request');

/* ROUTES (USER API) ROOTED AT /api/users/ */

// POST - USER SIGN UP
router.route('/')
.post(function(req, res){
  models.User.findOne({email: req.body.email}, function(err, user){
    if(user){
      return res.status(400).send({message: "Email already exists"});
    } else{
      models.User.create(req.body, function(err, created){
        if(err){
          return res.status(500).send(err);
        } else{
          return res.send(user);
        }
      });
    }
  });
});


// GET - RETRIEVE USER'S LIST OF MACHINE OBJECT IDs
router.route('/:user_id/machines/')
.get(function(req, res) {
  models.Machine.find({ user_id: req.params.user_id }, function(err, machines) {
    // console.log("machines found:", machines)
    res.send(machines);
  });
});

// GET - RETRIEVE USER DATA
// assumes incoming req contains user.id
router.route('/:user_id/')
.get(function(req, res) {
  models.User.findOne({_id: req.params.user_id}, function(err, user){
    if(!user){
      res.send({msg: "no user found"});
    } else {
      // console.log(user)
      res.send(user);
    }
  });
});


module.exports = router;
