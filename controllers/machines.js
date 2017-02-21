var express = require('express');
var router = express.Router();
var models = require('../models/schemas');
var mongoose = require('mongoose');
var request = require('request');

/* ROUTES (MACHINE API) ROOTED AT /api/machines/ */
// GET - GET ALL MACHINES EVER
router.route('/')
.get(function(req, res) {
  models.Machine.find({}, function(err, machines) {
    res.send(machines);
  })
})
.post(function(req, res) {
  models.User.findOne({ _id: req.body.user_id }, function(err, user) {
    if(!user) {
      res.send({msg: "no user found"});
    } else {
      models.Machine.create(req.body, function(err, machine){
        if(err){
          return res.status(500).send(err);
        } else {
          console.log(machine);
          return res.send(machine);
        }
      });
    }
  });
})

// GET - GET MACHINE DATA
// assumes incoming req contains machine.id
router.route('/:machine_id')
.get(function(req, res) {
  models.Machine.findOne({_id: req.params.machine_id}, function(err, machine){
    if(!machine){
      res.send({msg: "no machine found"});
    } else {
      console.log(machine)
      res.send(machine);
    }
  });
})
.put(function(req, res) {
  models.Machine.findOne({_id: req.params.machine_id}, function(err, machine){
    if(!machine){
      res.send({msg: "no machine found"});
    } else {
      console.log(machine);
      machine.name = req.body.name;
      machine.assetList = req.body.assetList;
      machine.save();
    }
  });
});


module.exports = router;
