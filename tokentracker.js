Tokens = new Meteor.Collection("tokens");

SimpleRelationalRanks = {
  beforeFirst: function(firstRank) { return firstRank - 1; },
  between: function(beforeRank, afterRank) { return (beforeRank + afterRank) / 2; },
  afterLast: function(lastRank) { return lastRank + 1; }
};

if (Meteor.isClient) {
  Template.tokens.tokens = function () {
    return Tokens.find({}, {sort: {rank: 1}});
  };

  Template.tokens.rendered = function() {
    var $list = $(this.lastNode);
    if ($list.data().sortable == true) {
      return;
    }
    $list.data('sortable', true);
    $list.sortable({
      stop: function(e, ui) {
        var el = ui.item;
        var before = ui.item.prev();
        var after = ui.item.next();
        var newRank;
        if (!before.length) {
          newRank = SimpleRelationalRanks.beforeFirst(after.data().rank);
        } else if (!after.length) {
          newRank = SimpleRelationalRanks.afterLast(before.data().rank);
        } else {
          newRank = SimpleRelationalRanks.between(before.data().rank, after.data().rank);
        }
        Tokens.update(el.attr('id'), {$set: {rank: newRank}});

        // FIXME: meteor is adding in an extra element after the update completes
        // should not need to clear out this local element
        el.remove();
      }
    });
  };

  Template.token.label_preview = function() {
    return this.label[0].toUpperCase();
  };

  Template.newtokenform.events({
    'submit #new_token': function(e) {
      e.preventDefault();
      var $form = $(e.target);
      var initiative = $form.find('input[name=initiative]').val() || 0;
      Tokens.insert({
        label: $form.find('input[name=label]').val(),
        initiative: initiative,
        rank: -initiative
      });
      $form.trigger('reset');
      $form.find('input[name=label]').focus();
    }
  });

  Template.token.events({
    'click .remove': function(e) {
      e.preventDefault();
      Tokens.remove(this._id);
    },
    'click .clone': function(e) {
      e.preventDefault();
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
