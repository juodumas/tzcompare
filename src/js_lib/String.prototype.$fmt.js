String.prototype.$fmt = function() {
  var args = arguments;
  return this.replace(/\{(\d+)\}/g, function(str, m1) {
    if (m1 >= args.length) {
      return str;
    }
    return args[m1];
  });
}; 
