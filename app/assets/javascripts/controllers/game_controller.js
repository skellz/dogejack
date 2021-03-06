App.GameController = Ember.ObjectController.extend({
  needs: ['application'],
  betAmount: null,

  canBet: function(){
    var balance = this.get('controllers.application.currentUser').get('wallets').get('content')[0].get('balance');
    if (balance > 0){
      return true
    }
  }.property('state'),

  validBet: function(){
    var balance = this.get('controllers.application.currentUser').get('wallets').get('content')[0].get('balance');
    if (parseInt(this.get('betAmount')) <= balance){
      this.get('controllers.application').set('errors', null);
      return true;
    } else {
      this.get('controllers.application').set('errors', 'Not a valid bet amount');
    }
  }.property('bet'),

  canDeal: function(){
    if (this.get('state') === 'started'){
      return true;
    }
  }.property('state'),

  canHit: function(){
    if (this.get('state') === 'players_turn'){
      return true;
    }
  }.property('state'),

  finished: function(){
    if (this.get('state') === 'finished'){
      return true;
    }
  }.property('state'),

  dealersTurn: function(){
    var that = this;
    if (this.get('state') === 'dealers_turn'){
      if (!this.dealersPlay){
        this.dealersPlay = setInterval(function(){that.send('getDealersCard')}, 750);
      }
      return true;
    } else if (this.get('state') === 'finished') {
      clearInterval(this.dealersPlay);
      this.dealersPlay = null;
    }
  }.property('state'),

  actions: {
    getDealersCard: function(){
      var that = this;
      $.get('/api/games/dealer').then(function(response){
        that.store.pushPayload('game', response);
      }, function(err){
      });
    },

    deal: function(){
      var that = this;
      if (this.get('bet') != 0){
        this.set('betAmount', this.get('bet'));
      }
      data = this.getProperties('betAmount');
      if (this.get('validBet')){
        $.get('/api/games/deal', data).then(function(response){
          that.store.pushPayload('game', response);
        }, function(err){
        });
      }
      this.set('betAmount', null);
    },

    hit: function(){
      var that = this;
      $.get('/api/games/hit').then(function(response){
        that.store.pushPayload('game', response);
      }, function(err){
      });
    },

    stand: function(){
      var that = this;
      $.get('/api/games/stand').then(function(response){
        that.store.pushPayload('game', response);
      }, function(err){
      });
    },

    again: function(){
      var that = this;
      this.set('betAmount', this.get('bet'));
      $.post('/api/games').then(function(response){
        that.store.pushPayload('game', response);
        that.game = that.store.getById('game', response.games[0].id);
        that.set('content', that.game);
        that.send('deal');
      }, function(err){
      });
    }
  }
});
