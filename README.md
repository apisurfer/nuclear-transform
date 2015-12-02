nuclear-transform
=================

![Build status](https://travis-ci.org/popc0rn/pirates-log.svg?branch=develop)

Library for "on the go" Nuclearjs Getter transforms. You can find info on Getters [here](https://optimizely.github.io/nuclear-js/docs/04-getters.html)

## Usage example

```javascript
import { transform } from 'nuclear-transform';

const adminNamesGetter = transform([
  // get current org
  [
    ['currentlySelectedOrganization'],
    ['organizations'],
    (id, orgs) => {
      return orgs[id];
    }
  ],
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

const adminNames = reactor.evaluate(adminNamesGeter);
console.log(adminNames);

```

## What does it solve?
It simplifies composing Getters that conditionally or dynamically(based on other inputs) return some data.

From given usage example: you have a list of users that are registered on one of the websites under one of the organizations.
If somebody selects specific organization and you need to show all the related administrators you would need to filter websites under that org and afterwards filter users under that websites. Filtering users depends on the data that is returned from website Getter, which in turn depends on the data returned by the selected organization Getter.

Composing Getters using nothing else but Getter syntax can be hard to grasp when you want to get reduced data with just one call to reactor.evaluate.
This problem can be solved using [multiple approaches](https://github.com/popc0rn/nuclear-transform/blob/master/related-info.md), none of which is great.

nuclear-transform composes Getters for you and allows you to transform the data in intermediate steps. Cool thing is that after just one reactor.evaluate call you can get exact value you are looking for.

### Types allowed in transform list
- KeyPath, Getter and function
- **1st element must be KeyPath or Getter**

### Features
- every function gets data from KeyPaths and Getters that precede it, including the data from previous function call as parameters
- functions reduce/transoform values share the same context so it's possible to save state/flags between reducers for more complex decision making
