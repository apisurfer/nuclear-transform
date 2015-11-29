nuclear-transform
=================

Tiny library for "on the go" Nuclearjs Getter transformation/reduce.
If you don't know what Nuclearjs Getter is, you can take a look here: [Nuclearjs Getters](https://optimizely.github.io/nuclear-js/docs/04-getters.html)

**Disclaimer: this document is just a pile of mumbo jumbo until I get the time to properly clean it up and explain everything properly.**

## What does this library solve?
It simplifies composing Getters that conditionaly or dynamically(based on other inputs) return some data.

E.g. you have a list of users that are registered on one of the websites under one of the organizations.
If somebody selects specific organization and you need to show all the related administrators you would need to filter websites under that org and afterwards filter users under that websites. Filtering users depends on the data that is returned from website Getter, which in turn depends on the data returned by the selected organization Getter.

This problem can be solved using multiple approaches:

### 1. Get all the lists with keypaths and do the filtering outside of nuclearjs

This method spreads filtering logic to multiple places and often clutters the rest of the domain logic. You get fat data objects that you then need to reduce to meaningful required values. This means you'll prepare the data on multiple layers of application. Through reactor.evaluate, and after, through your custom logic to further reduce.

### 2. Use Nuclearjs Getter to specify required lists and transform function
It would go something like this:

```javascript
reactor.evaluate([
  ['currentlySelectedOrganization'],
  ['organizations'],
  ['websites'],
  ['users'],
  (selectedOrg, orgs, websites, users) => {
    // handle all the lists and filtering inside this function and return reduced value
  }
]);
```
This results in a bunch of filtering code inside reduce function that is entangled with different data types and is usually hard to reuse.

### 3. Creating Getter "creator functions"

To answer some of the struggles from the 2nd approach you could write functions that recieve parameters and create a Getter.
Something like this:

```javascript
/*
users store is list of
{
  id: 12323,
  websiteId: 2,
  name: 'John'
  permission: 'administrator' | 'moderator' | 'regular'
}
*/

function getWebsiteAdministrators(websiteId) {
  return [
    ['users'],
    users => {
      return users.filter(user => {
        return user.websiteId === websiteId && user.permission === 'administrator';
      });
    }
  ];
}

// evaluate the value with the created Getter
const admins = reactor.evaluate(getWebsiteAdministrators(2));
```

Now this is better. Functions that encapsulate reduce logic for different entities or even better, for different data types(to maximize code reuse; not shown in this examples).

// imagine we already have getOrganizationById, getWebsitesInOrganization defined.

```javascript
const org = reactor.evaluate(getOrganizationById('11111111'));
const websites = reactor.evaluate(getWebsitesInOrganization(org.id));
const users = [];
websites.forEach(website => {
  const userList = reactor.evaluate(getWebsiteAdministrators(org.id));
  users.concat(userList);
});

// now we have administrator inside a 'users' list
```

Downside is that we need to reduce the data sets in turns and outside Getters. Remember every Getter in this sequence depends on the results form the previous one. Fair amount of work to get the data in a shape we need, wouldn't you agree?!

### 4. Nesting Getters
Another aproach using Getter "creators" from 3. point is nesting them so the evaluations doesn't need to work in turns outside of nuclearjs.
Example:

  [
    getOrganizationById('11111111'),
    getWebsitesInOrganization,
  ]

```javascript
reactor.evaluate([
  [
    [
      getOrganizationById('11111111'),
      getWebsitesInOrganization,
    ],
    getAllUsersInsideWebsites
  ],
  users => {
    return users.filter(user => {
      return user.websiteId === websiteId && user.permission === 'administrator'
    });
  }
]);
```
This method filters all the data inside nuclearjs and returns reduced results. Neat, right? But kind of complex to reason about. I.e. for Nuclearjs to resolve value it first needs to resolve the first value of the Getter which is also a Getter. To resolve that first Getter it also needs to work on its 1st array value. Basically it all starts from the deepest members of Getter(in this case getOrganizationById) and then gets resolved outwards until we reach the root Getter structure.
This is hard to comprehend since the process starts with the list of organizations, but inside this structure they don't seem to be the starting point. Any deeper relations would look even more awkward and hard to think about.

### 5. nuclear-transform
Usage example:

```javascript
import { transform } from 'nuclear-transform';

const administrators = reactor.evaluate(
  transform([
    ['currentlySelectedOrganization'],
    [
      ['organizations'],
      (selectedOrg, orgs) => {
        return orgs[selectedOrg];
      }
    ],
    [
      ['websites'],
      (organization, websites) => websites.filter(web => web.organizationId === organization.id)
    ],
    [
      ['users'],
      (websites, users) => users.filter(user => user.websiteId === websiteId && user.permission === 'administrator')
    ]
  ]);
);

console.log(administrators);

```
Voila! Creation of getters on the fly. Reducer functions could also be Getter creator functions that are predefined somewhere. The best thing is that after the reactor.evaluate call we now have exactly the value we need and nothing else to mess with :)
