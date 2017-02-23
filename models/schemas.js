var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

// MACHINE SCHEMA
// contains one gube-roldberg machine's set of assets and asset data
var machineSchema = new mongoose.Schema({
  user_id: String,
  name: String,
  assetList: {}
}, {
  collection: 'Machines'
});
var Machine = mongoose.model('Machines', machineSchema);

// USER SCHEMA
// contains user data
var UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type:  String,
    required: true
  },
  machines: [machineSchema]
},{
  collection: 'Users'
});

UserSchema.set('toJSON', {
  transform: function(doc, ret, options){
    var returnJson = {
      id: ret._id,
      email: ret.email,
      name: ret.name
    }
    return returnJson;
  }
});

UserSchema.methods.authenticated = function(password){
  var user = this;
  var isAuthenticated = bcrypt.compareSync(password, user.password);
  return isAuthenticated ? user : false;
}

UserSchema.pre('save', function(next){
  if(!this.isModified('password')){
    // if password not changed, do nothing:
    next();
  } else{
    // if password modified, hash it:
    this.password = bcrypt.hashSync(this.password, 10);
    next();
  }
})

var User = mongoose.model('User', UserSchema);


// EXPORTS
module.exports = {
  Machine: Machine,
  User: User
};
