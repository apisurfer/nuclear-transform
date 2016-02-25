nuclear-transform
=================

![Dependencies status](https://david-dm.org/popc0rn/nuclear-transform.svg) ![Build status](https://travis-ci.org/popc0rn/pirates-log.svg?branch=develop)

Library for "on the go" [Nuclearjs Getter](https://optimizely.github.io/nuclear-js/docs/04-getters.html) transformations. It composes Getters and allows you to transform the data in intermediate steps without multiple round trips through reactor.evaluate.

**Old version** with a slightly different approach on reducing values can be found [here](https://github.com/popc0rn/nuclear-transform/tree/0.0.4)

## Example

```javascript
import { transform } from 'nuclear-transform';
import reactor from './reactor';  // your reactor instance
import { getter1, getter2, getter3, keypath1 } from './getters';  // import your getters & keypaths

const firstTransform = transform([
  getter1,
  keypath1,
  getter2,
  // as normal getter; this function gets called with data returned from specified getters and keypaths before it
  // difference is that it can transform the data and return it as the usual getter
  (g1, k1, g2) => {... return someArray },
  // function returned array so we can further transform it
  someArray => { let i = 0; return arr.map(() => i++); },
  // function returns transformed array
  // pull in additional data
  getter3,
  // process transformed array and additional data to get new value
  (mappedArray, g3) => { ... return newValue ) },
  // finally output the desired value
  newValue => newValue.length, // finally return reduced value
]);

// reactor.evaluate(firstTransform)

export default firstTransform;
```

### Nesting composed getters

```javascript
import firstTransform from './firstTransform'
// import getters and functions...

const secondTransform = transform([
  firstTransform, // reuse transformed getter
  keypath2,  // pull in additional data
  getter4,   // pull in additional data
  func1, //  return value base on fT, k2, g4
  getter5,  // pull in additional data
  getter6,  // pull in additional data
  (f1, g5, g6) => { ….return value on last 3 parameters}, // final result
]);

// reactor.evaluate(secondTransform)
```

One reactor.evaluate call and you get exactly the data you need.
You can combine existing getters and keypaths with universal filter/transform functions to maximize code reuse.

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

Composing Getters using nothing else but Getter syntax can be hard to grasp when you want to get reduced data with just one call to reactor.evaluate.
This problem can be solved using [multiple approaches](https://github.com/popc0rn/nuclear-transform/blob/master/related-info.md), none of which is all that great.

## License
[MIT](https://opensource.org/licenses/MIT) © [popc0rn](http://popc0rn.me)
