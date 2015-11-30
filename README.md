nuclear-transform
=================

Library for "on the go" Nuclearjs Getter transformation/reduce.
If you don't know what Nuclearjs Getter is, you can take a look here: [Nuclearjs Getters](https://optimizely.github.io/nuclear-js/docs/04-getters.html)

## What does this library solve?
It simplifies composing Getters that conditionaly or dynamically(based on other inputs) return some data.

E.g. you have a list of users that are registered on one of the websites under one of the organizations.
If somebody selects specific organization and you need to show all the related administrators you would need to filter websites under that org and afterwards filter users under that websites. Filtering users depends on the data that is returned from website Getter, which in turn depends on the data returned by the selected organization Getter.

Composing Getters using nothing else but Getter syntax can be hard to grasp when you want to get reduced data with just one reactor.evaluate call. This is why I created this simple lib.
This problem can be solved using multiple approaches [discussed here](https://github.com/popc0rn/nuclear-transform/blob/master/related-info.md). This is how nuclear-transform solves it:

## nuclear-transform
Usage example:

```javascript
import { transform } from 'nuclear-transform';

const administratorNames = reactor.evaluate(
  transform([
    [
      ['currentlySelectedOrganization'],
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
    ],
    users => users.map(user => user.name)
  ]);
);

console.log(administratorNames);

```

Reducer/transform functions could also be predefined functions that create Getters for specific types or entities. The best thing is that after the reactor.evaluate call we have exactly the value we need and nothing else to mess with outside of Nuclearjs :)

### Types allowed in transform list
- First element of the list can be either Keypath or Getter
- all other elements need to be Getter or normal javascript functions that reduce/transform passed value from previous computation

### Features
- every function is passed result from previous computation as 1st function parameter
- Getters can pull in additional data from stores as usual, and their functions will receive previously computed data as 1st param
- All functions that reduce/transoform values share the same context so it's possible to save state/flags for other functions in a transform list more complex decision making
