if (!Object.keys) {
  Object.keys = function(o) {
    if (o !== Object(o)) {
      throw new TypeError('Object.keys called on a non-object');
    }
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        result = [];
    for (var p in o) {
      if (hasOwnProperty.call(o, p)) {
        result.push(p);
      }
    }
    return result;
  };
}
