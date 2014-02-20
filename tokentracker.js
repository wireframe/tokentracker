Tokens = new Meteor.Collection("tokens");

Tokens.findNextAvailableRank = function(requestedRank) {
  var allTokens = Tokens.find({}, {sort: {rank: 1}}).fetch();
  var ranks = _.map(allTokens, function(token) {
    return token.rank;
  });
  if (!_.contains(ranks, requestedRank)) {
    return requestedRank;
  }
  var nextAvailableRank = null;
  if (_.last(ranks) === requestedRank) {
    nextAvailableRank = SimpleRelationalRanks.afterLast(requestedRank);
  } else {
    var rankRange = _.first(_.reject(ranks, function(tokenRank) {
      return tokenRank < requestedRank;
    }), 2);
    nextAvailableRank = SimpleRelationalRanks.between(rankRange[0], rankRange[1]);
  }
  return nextAvailableRank;
};

Tokens.counterForLabel = function(label) {
  return Tokens.find({label: label}).count() + 1;
};

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

  Template.token.hasCounter = function() {
    return this.counter > 1;
  };

  Template.newtokenform.events({
    'submit #new_token': function(e) {
      e.preventDefault();
      var $form = $(e.target);
      var initiative = $form.find('input[name=initiative]').val() || 1;
      var rank = Tokens.findNextAvailableRank(-initiative);
      var label = $form.find('input[name=label]').val();
      Tokens.insert({
        label: label,
        initiative: initiative,
        rank: rank,
        counter: Tokens.counterForLabel(label),
        damage: 0
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
      var newRank = Tokens.findNextAvailableRank(this.rank);
      Tokens.insert({
        label: this.label,
        initiative: this.initiative,
        rank: newRank,
        counter: Tokens.counterForLabel(this.label),
        damage: 0
      });
    },
    'click .addDamage': function(e) {
      e.preventDefault();
      var damageIncrease = parseInt(prompt("Add damage to token", "0")) || 0;
      Tokens.update(this._id, {$inc: {damage: damageIncrease}});
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
