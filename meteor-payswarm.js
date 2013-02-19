// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {
  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["$0",
                   "$0-10",
                   "$10-20",
                   "$20-100",
                   "$100-200",
                   "$200-500"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Math.random()*10)*5});
    }
  });
}


///////////////////// payswarm client side stuff //////////////////

if (Meteor.isClient) {
  Meteor.startup(function () {
var taskadd_cmd = "node /root/venture/payswarm.js/examples/publish-asset-for-sale.js --config /root/venture/payswarm.js/examples/payswarm.cfg";
console.log(taskadd_cmd);
Meteor.call('create_listing', taskadd_cmd);
})
}

//////////////////// end of payswarm client side stuff ////////////




//////////////////// payswarm server side stuff /////////////////////

if(Meteor.is_server) {
 var exec;

 // Initialize the exec function
 Meteor.startup(function() {
  exec = __meteor_bootstrap__.require('child_process').exec;
console.log('meteor_bootstrap');
 });

 Meteor.methods({
  'create_listing': function(line) {
   // Run the requested command in shell
   exec(line, function(error, stdout, stderr) {
console.log('exec working');
    // Collection commands must be executed within a Fiber
    Fiber(function() {

var payswarmcom = stdout ? stdout : stderr;

console.log(payswarmcom);
//console.log(payswarmcom[0].description);
//console.log(payswarmcom[0].tags);
//console.log(payswarmcom[0].uuid);

Players.insert({name: payswarmcom,
              text: payswarmcom[0].description,
  });

    }).run();
   });
  }
 });

}



///////////////////// end of payswarm server side stuff ////////////////////////
