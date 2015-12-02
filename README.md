nuclear-transform
=================

![Build status](https://travis-ci.org/popc0rn/pirates-log.svg?branch=develop)

Library for "on the go" [Nuclearjs Getter](https://optimizely.github.io/nuclear-js/docs/04-getters.html) transformations.

nuclear-transform composes Getters for you and allows you to transform the data in intermediate steps. This allows you to receive exactly the data you want from just one reactor.evaluate call. No more round trips.

## Example

```javascript
import { transform } from 'nuclear-transform';
import reactor from './reactor';

const adminNamesGetter = transform([
  // get current org
  [
    ['currentlySelectedOrganization'],
    ['organizations'],
    (id, orgs) => {
      return orgs[id];
    }
  ],

  // get websites
  ['websites'],

  // filter websites by organization id
  (org, websites) => websites.filter(web => web.organizationId === org.id),

  // fetch users
  ['users'],

  // filter admin users for given websites
  (websites, users) => {
    const list = [];
    websites.forEach(website => {
      users.forEach(user => {
        if (user.websiteId === website.id && user.admin === true) list.push(user);
      });
    });
  },

  // map users to just names
  users => users.map(u => u.name)
]);

// log admin names list
console.log(reactor.evaluate(adminNamesGeter));

```

## Types allowed in transform list
- **1st element must be KeyPath or Getter**
- **last element must be a function**
- KeyPaths, Getters and functions

## Features
- every function gets the data from KeyPaths and Getters that precede it, including the data from previous function call as parameters
- functions that transform values share the same context so it's possible to save state/flags between them for more complex decision making
- since return value is a regular Getter it can be combined inside other transforms

## How it works
It puts KeyPaths and Getters on a list until it stumbles on a function. Then it wraps traversed elements to a Getter and sets it as the 1st element of a new Getter that it starts to build. This process repeats until the last function(last item) is reached and we are left with the one "fat" Getter.

## Why?
It simplifies composing Getters that conditionally or dynamically(based on other inputs) return some data.

Given problem: you have a list of users that are registered on one of the websites under one of the organizations.
To get all admins under one organization you would need to filter websites under that org and afterwards filter users under the websites. Filtering users depends on the data that is returned from website Getter, which in turn depends on the data returned by the selected organization Getter.

Composing Getters using nothing else but Getter syntax can be hard to grasp when you want to get reduced data with just one call to reactor.evaluate.
This problem can be solved using [multiple approaches](https://github.com/popc0rn/nuclear-transform/blob/master/related-info.md), none of which is all that great.

## License
[MIT](https://opensource.org/licenses/MIT) © [popc0rn](http://popc0rn.me)
