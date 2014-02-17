Tokens = new Meteor.Collection("tokens");

if (Meteor.isClient) {
  Template.tokens.tokens = function () {
    return Tokens.find({}, {sort: {initiative: -1}});
  };

  Template.token.label_preview = function() {
    return this.label[0].toUpperCase();
  };

  Template.newtokenform.events({
    'submit #new_token': function(e) {
      e.preventDefault();
      var $form = $(e.target);
      Tokens.insert({
        label: $form.find('input[name=label]').val(),
        initiative: $form.find('input[name=initiative]').val()
      });
      $form.trigger('reset');
    }
  });

  Template.token.events({
    'click .remove': function() {
      Tokens.remove(this._id);
    },
    'click .clone': function() {
      Tokens.insert({
        label: this.label,
        initiative: this.initiative
      });
    }
  });
}

// code to run on server at startup
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Tokens.find().count() === 0) {
      var labels = [
        "Leoven",
        "Jarvis",
        "Ghoul"
      ];
      for (var i = 0; i < labels.length; i++) {
        var initiative = Math.floor((Math.random() * 20) + 1);
        Tokens.insert({
          label: labels[i],
          initiative: initiative
        });
      }
    }
  });
}
