var nuclear = require('nuclear-js');
var Reactor = nuclear.Reactor;
var Store = nuclear.Store;
var toImmutable = nuclear.toImmutable;

var reactor = new Reactor();
var orgsData = [
  { title: 'org 1', id: '1' },
  { title: 'org 2', id: '2' },
];
var websitesData = [
  { title: 'website 1', id: '1', orgId: '1' },
  { title: 'website 2', id: '2', orgId: '2' },
  { title: 'website 3', id: '3', orgId: '2' },
];
var usersData = [
  { name: 'user 1', id: '1', wId: '3', permission: 'admin' },
  { name: 'user 2', id: '2', wId: '3', permission: 'moderator' },
  { name: 'user 3', id: '3', wId: '2', permission: 'regular' },
  { name: 'user 4', id: '4', wId: '1', permission: 'admin' },
  { name: 'user 5', id: '5', wId: '3', permission: 'admin' },
];

var noop = function() {};

var userStore = Store({
  getInitialState: function() {
    return toImmutable(usersData);
  },
  initialize: noop,
});

var websiteStore = Store({
  getInitialState: function() {
    return toImmutable(websitesData);
  },
  initialize: noop,
});


var orgsStore = Store({
  getInitialState: function() {
    return toImmutable(orgsData);
  },
  initialize: noop,
});

reactor.registerStores({
  organizations: orgsStore,
  websites: websiteStore,
  users: userStore,
});

module.exports = {
  reactor: reactor,
  usersData: usersData,
  websitesData: websitesData,
  orgsData: orgsData,
};
