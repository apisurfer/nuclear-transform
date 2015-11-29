import { isString, isFunction, isArray } from 'fighterr';

function reduceGetter(getter, reducer) {
  const reducerIsFunction = isFunction(reducer);
  const reducerIsArray = isArray(reducer);

  if (!reducerIsFunction && !reducerIsArray) {
    throw new Error('reduceGetter: reducer needs to be a function or array!');
  }

  if (reducerIsArray && !isFunction(reducer[reducer.length - 1])) {
    throw new Error('reduceGetter: when reducer is defined as array, last member needs to be reduce function');
  }

  if (reducerIsFunction) {
    return [
      getter,
      reducer,
    ];
  }

  // otherwise reducer is defined through array
  if (isString(getter[0])) {
    return [[getter]].concat(reducer);
  }

  return [getter].concat(reducer);
}

function transform(getterList) {
  let wrapped = getterList.shift();
  let next = getterList.shift();

  while (next) {
    wrapped = reduceGetter(wrapped, next);
    next = getterList.shift();
  }

  return wrapped;
}

module.exports = {
  transform: transform,
  reduceGetter: reduceGetter,
};
