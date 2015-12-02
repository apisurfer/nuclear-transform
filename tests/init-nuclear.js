var nuclear = require('nuclear-js');
var Reactor = nuclear.Reactor;
var Store = nuclear.Store;
var toImmutable = nuclear.toImmutable;

var reactor = new Reactor();
var usersData = [
  { username: 'user 1', id: 1, wId: 1 },
  { username: 'user 2', id: 2, wId: 2 },
  { username: 'user 3', id: 3, wId: 3 },
];
var websitesData = [
  { title: 'website 1', id: 1 },
  { title: 'website 2', id: 2 },
  { title: 'website 3', id: 3 },
];

var userStore = Store({
  getInitialState: function() {
    return toImmutable(usersData);
  },
  initialize: function () {},
});

var websiteStore = Store({
  getInitialState: function() {
    return toImmutable(websitesData);
  },
  initialize: function () {},
});

reactor.registerStores({
  users: userStore,
  websites: websiteStore,
});

module.exports = {
  reactor: reactor,
  usersData: usersData,
  websitesData: websitesData,
};
