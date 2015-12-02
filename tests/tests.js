require('phantomjs-polyfill');
var toJS = require('nuclear-js').toJS;
var transform = require('../index');
var nuclear = require('./init-nuclear.js');
var reactor = nuclear.reactor;
var usersData = nuclear.usersData;
var websitesData = nuclear.websitesData;
var orgsData = nuclear.orgsData;
var tape;

// just a bunch of very stupid filtering procedures
var organizationGetter = ['organizations', '1']; // 2nd org from store list
var websitesGetter = ['websites'];
var adminUsersGetter = [
  ['users'],
  function getAdmins(users) {
    return users.filter(function (user) {
      return user.get('permission') === 'admin';
    });
  },
];

var _reducers = {
  filterWebsites: function (org, websites) {
    tape.filterWebsites(org.toJS(), websites.toJS());

    return websites.filter(function (website) {
      return website.get('orgId') === org.get('id');
    });
  },
  filterWebsiteUsers: function (websites, users) {
    tape.filterWebsiteUsers(websites.toJS(), users.toJS());

    return users.filter(function(u) {
      return websites.findIndex(function(w) { return w.get('id') === u.get('wId'); }) !== -1;
    });
  },
  mapUserNames: function (users) {
    tape.mapUserNames(users.toJS());

    return users.map(function (u) { return u.get('name'); });
  },
  count: function (list) {
    tape.count(list.toJS());

    return list.count();
  },
};

var list = [
  organizationGetter,
  websitesGetter,
  _reducers.filterWebsites,
  adminUsersGetter,
  _reducers.filterWebsiteUsers,
  _reducers.mapUserNames,
];

describe('transform', function() {
  beforeEach(function() {
    tape = jasmine.createSpyObj('tape', [
      'filterWebsites',
      'filterWebsiteUsers',
      'mapUserNames',
      'count',
    ]);
  });

  it('should create a Getter that returns the expected value', function() {
    var getter = transform(list);
    expect(reactor.evaluateToJS(getter))
    .toEqual([
      usersData[0].name,
      usersData[4].name
    ]);
  });

  it('should correctly compose transforms', function() {
    var adminNamesGetter = transform(list);
    var composedGetter = transform([adminNamesGetter, _reducers.count]);
    expect(reactor.evaluateToJS(composedGetter)).toBe(2);
  });

  it('should call transform functions with correct params', function() {
    var adminNamesGetter = transform(list);
    var composedGetter = transform([adminNamesGetter, _reducers.count]);
    reactor.evaluateToJS(composedGetter);

    expect(tape.filterWebsites).toHaveBeenCalledWith(orgsData[1], websitesData);
    expect(tape.filterWebsiteUsers).toHaveBeenCalledWith(
      [websitesData[1], websitesData[2]],
      [usersData[0], usersData[3], usersData[4]]
    );
    expect(tape.mapUserNames).toHaveBeenCalledWith([usersData[0], usersData[4]]);
    expect(tape.count).toHaveBeenCalledWith([usersData[0].name, usersData[4].name]);
  });

  it('should throw when length of the list is < 2', function() {
    function testThrow() { transform([]); }
    var e = new Error('transform: list should contain at least a getter and reducer function!');
    expect(testThrow).toThrow(e);
  });

  it('should throw when 1st item is not KeyPath or Getter', function() {
    function testThrow() { transform(['test', 'test2', function() {}]); }
    var e = new Error('transform: first item needs to be KeyPath or Getter!');
    expect(testThrow).toThrow(e);
  });

  it('should throw when last item is not a function', function() {
    function testThrow() { transform([['test'], ['test2']]); }
    var e = new Error('transform: last item needs to be a function!');
    expect(testThrow).toThrow(e);
  });

  it('should throw when any item is not KeyPath/Getter or function', function() {
    function testThrow() { transform([['test'], ['test2'], 'foo', function() {}]); }
    var e = new Error('transform: transform items must be functions or KeyPath/Getter!');
    expect(testThrow).toThrow(e);
  });
});