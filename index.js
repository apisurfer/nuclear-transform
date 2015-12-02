function isFunction(obj) {
  return typeof obj == 'function' || false;
}

function isArray(obj) {
  return Array.isArray(obj);
}

function transform(list) {
  var ctx = {};
  var wrapped = [];

  for (var i = 0; i < list.length; i++) {
    var next = list[i];
    var isLast = (i === list.length - 1);
    var nextIsFunction = isFunction(next);
    var nextIsArray = isArray(next);

    if (!nextIsFunction && !nextIsArray) {
      throw new Error('reduce: transform item need to be a function or KeyPath/Getter!');
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
