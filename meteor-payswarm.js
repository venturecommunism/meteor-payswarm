// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");
Listings = new Meteor.Collection("listings");

if (Meteor.isClient) {

///////////////// payswarm template and events //////////////////

 Template.payswarm.listings = function () {
    return Listings.find({}, {sort: {score: -1, listing: 1}});
  };

  Template.payswarm.selected_listing = function () {
    var listing = Listings.findOne(Session.get("selected_listing"));
    return listing && listing.name;
  };

 Template.listing.selected = function () {
    return Session.equals("selected_listing", this._id) ? "selected" : '';
 };


  Template.payswarm.events({
    'click input.list': function () {
        Meteor.call('create_listing');
        console.log('create listing works');
    }
  });

  Template.payswarm.events({
    'click input.pay': function () {
        Meteor.call('purchase_asset');
        console.log('pay button works');
    }
  });

  Template.listing.events({
    'click': function () {
      Session.set("selected_listing", this._id);
    }
  });


  Template.listing.thing = function () {
    return 'thing';
    };


///////////////// end payswarm template and events /////////////

}



//////////////////// payswarm server side stuff /////////////////////

if(Meteor.isServer) {
 var exec;

 // Initialize the exec function
 Meteor.startup(function() {
  exec = __meteor_bootstrap__.require('child_process').exec;
 });

 Meteor.methods({
  'create_listing': function() {
  // Run the requested command in shell
  var line = "node /root/venture/payswarm.js/examples/publish-asset-for-sale.js --config /root/venture/payswarm.js/examples/payswarm.cfg";
  exec(line, function(error, stdout, stderr) {
    // Collection commands must be executed within a Fiber
    Fiber(function() {

 var payswarmcom = stdout ? stdout : stderr;

//console.log(payswarmcom);
//console.log(payswarmcom[0].tags);
//console.log(payswarmcom[0].uuid);

var httpcall = Meteor.http.call("GET", stdout);
//var contentholder = eval('(' + httpcall + ')');
var contentholder = JSON.parse(httpcall.content);
//console.log(contentholder);
//console.log("");
var title = contentholder["@graph"][0]["title"];
console.log(title);
var context = contentholder["@context"];

Listings.insert({name: stdout,
                 title: title,
  });

if(Meteor.isClient) {
return payswarmcom;
}

    }).run();
   });
  }
 });

}



///////////////////// end of payswarm server side stuff ////////////////////////
