require('phantomjs-polyfill');
var transform = require('../index');
var nuclear = require('./init-nuclear.js');
var reactor = nuclear.reactor;
var usersData = nuclear.usersData;
var websitesData = nuclear.websitesData;

// just a bunch of very stupid filtering procedures
var list = [
  ['users'],
  function getUser(users) {
    return users.find(function (u) { return u.get('id') === 2; });
  },
  function getUsername(user) {
    return user.get('username');
  },
  ['users'],
  function getUserAgain(username, users) {
    return users.find(function (user) {
      return user.get('username') === username;
    });
  },
  function getUsersWid(user) {
    return user.get('wId');
  },
  ['websites'],
  ['users'],
  function bundleData(wId, ws, us) {
    var website = ws.find(function(w) { return w.get('id') === wId; });
    var user = us.find(function(u) { return u.get('wId') === wId; });

    return {
      website: website.toJS(),
      user: user.toJS(),
    };
  }
];

describe('transform', function() {
  it('should generate correct Getters', function() {
    var getter = transform(list);

    expect(reactor.evaluateToJS(getter)).toEqual({
      website: websitesData[1],
      user: usersData[1],
    });
  });
});