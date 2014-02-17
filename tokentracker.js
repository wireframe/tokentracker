Tokens = new Meteor.Collection("tokens");

if (Meteor.isClient) {
  Template.tokens.tokens = function () {
    return Tokens.find({}, {sort: {initiative: -1}});
  };

  Template.token.events({
    'click .remove': function() {
      Tokens.remove(this._id);
    },
    'click .clone': function() {
      Tokens.insert({
        name: this.name,
        initiative: this.initiative
      });
    }
  });
}

// code to run on server at startup
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Tokens.find().count() === 0) {
      var names = [
        "Leoven",
        "Jarvis",
        "Ghoul"
      ];
      for (var i = 0; i < names.length; i++) {
        var initiative = Math.floor((Math.random() * 20) + 1);
        Tokens.insert({
          name: names[i],
          initiative: initiative
        })
      }
    }
  });
}
