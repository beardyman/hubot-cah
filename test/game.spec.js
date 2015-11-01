require('coffee-script');
var expect = require('chai').expect;
var _ = require('lodash');
var proxyquire = require('proxyquire').noCallThru();

describe('game logic', function () {
  var deckMock;


  beforeEach(function() {
    deckMock = {
      availableDecks: function() {return ['main'];},
      activeDecks: function() {return ['main'];},
      setModes: function() {},
      whiteCards: function() {
        return [
          "72 virgins",
          "8 oz. of sweet Mexican black-tar heroin",
          "A 55-gallon drum of lube",
          "A Bop It",
          "A Burmese tiger pit",
          "A Christmas stocking full of coleslaw",
          "A Gypsy curse",
          "A Hungry-Man Frozen Christmas Dinner for One",
          "A PowerPoint presentation",
          "A Super Soaker full of cat pee"
        ];
      },
      blackCards: function() {
        return [
          "_____. That's how I want to die.",
          "_____: good to the last drop.",
          "_____? There's an app for that."
        ];
      }
    };

    Game = proxyquire('../src/game', {
      './deck': deckMock
    });
  });

  it('should get a list of players who haven\'t answered', function () {
    var game = new Game({});
    game.init({
      cah: {
        "activePlayers": [
          "jordan",
          "nancy",
          "rhodes.json",
          "cfs",
          "richleland",
          "bobevans"
        ],
        "czar": "cfs",
        "answers": [
          ["richleland", ["A robust mongoloid."]],
          ["jordan", ["The invisible hand."]],
          ["rhodes.json", ["My collection of high-tech sex toys."]]
        ]
      }
    });

    expect(game.who_hasnt_answered()).to.deep.equal(['nancy', 'bobevans']);
  });

  it('should deal all the cards without repeating', function () {
    var game = new Game({}), nWhite, nBlack, card, dealt = [];
    game.resetDecks();
    nWhite = game.db.decks.white.length;
    nBlack = game.db.decks.black.length;

    for (var i=0; i<nWhite; i++) {
      card = game.deal_card('white');
      expect(dealt).to.not.contain(card);
      dealt.push(card);
    }

    expect(game.db.decks.white.length).to.equal(0);
  });

  it('should deal cards to all players without repeating', function () {
    var game = new Game({}), all, expectedN, startCount;
    game.init({ cah: {
      activePlayers: ['player1', 'player2', 'player3', 'player4', 'player5'],
      hands: {
        player1: [],
        player2: [],
        player3: [],
        player4: [],
        player5: []
      },
      handsize: 2
    }});

    game.resetDecks(); // populate decks

    expectedN = game.db.activePlayers.length * game.db.handsize;
    startCount = game.db.decks.white.length;

    game.fix_hands();
    all = _.reduce(game.db.hands, function (a, b) {
      return a.concat(b);
    }, []);
    expect(_.uniq(all).length).to.equal(expectedN);
    expect(game.db.decks.white.length).to.equal(startCount - expectedN);
  });

  it('should return a list of scores in numerical descending order', function () {
    var game = new Game({});
    game.init({ cah: {
      scores: {
        "max": 5,
        "jason": 22,
        "cole": 3,
        "old nancy": 0 
      }
    }});
    expect(game.get_leaderboard()).to.deep.equal([
      { name: 'jason', score: 22 },
      { name: 'max', score: 5 },
      { name: 'cole', score: 3 },
      { name: 'old nancy', score: 0 }
    ]);
  });

  it('should use decks passed in to init', function() {
    var game = new Game({});
    game.init({
      cah: {
        decks: {
          ud: ['urban dict'],
          white: ['Carnies'],
          black: ['When I pooped, what came out of my butt?']
        }
      }
    });

    expect(game.db.decks.ud[0]).to.equal('urban dict');
    expect(game.db.decks.white[0]).to.equal('Carnies');
    expect(game.db.decks.black[0]).to.equal('When I pooped, what came out of my butt?');
  });

  it('should use initialize decks to empty arrays', function() {
    var game = new Game({});
    game.init({
      cah: {}
    });

    expect(game.db.decks.ud).to.deep.equal([]);
    expect(game.db.decks.white).to.deep.equal([]);
    expect(game.db.decks.black).to.deep.equal([]);
  });

  describe('duplicate submission check', function () {

    var data;

    beforeEach(function () {
      data = { cah: { answers: [
        ['joe', ['what a dumb design']],
        ['mary', ['why arrays']],
        ['jorb', ['why not objects unngggh']]
      ]}};
    });

    it('should return false if person has not submitted yet', function() {
      var game = new Game();
      game.init(data);
      expect(game.hasAlreadySubmitted('bowie')).to.be.false;
    });

    it('should return true if person has already submitted', function() {
      var game = new Game();
      game.init(data);
      expect(game.hasAlreadySubmitted('jorb')).to.be.true;
    });

  });

});