function isFunction(obj) {
  return typeof obj == 'function' || false;
}

function isArray(obj) {
  return Array.isArray(obj);
}

function transform(list) {
  var ctx = {};
  var wrapped = [];
  var isFirstElementArray = isArray(list[0]);
  var isLastElementFunc = isFunction(list[list.length - 1]);

  if (list.length < 2) {
    throw new Error('transform: list should contain at least a getter and reducer function!');
  }

  if (!isFirstElementArray) {
    throw new Error('transform: first item needs to be KeyPath or Getter!');
  }

  if (!isLastElementFunc) {
    throw new Error('transform: last item needs to be a function!');
  }

  for (var i = 0; i < list.length; i++) {
    var next = list[i];
    var isLast = (i === list.length - 1);
    var nextIsFunction = isFunction(next);
    var nextIsArray = isArray(next);

    if (!nextIsFunction && !nextIsArray) {
      throw new Error('transform: transform items must be functions or KeyPath/Getter!');
    }

    if (nextIsFunction) {
      wrapped.push(next.bind(ctx));
      // wrap as Getter only if it's not the last element in the transform list
      wrapped = isLast ? wrapped : [wrapped];
    } else {
      wrapped.push(next);
    }
  }

  return wrapped;
}

module.exports = transform;
