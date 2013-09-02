Date.prototype.$fmt = function(fmt) {
  var pad = function(x) { return x < 10 ? '0' + x : x; };
  var d = this;
  if (!fmt) {
    fmt = '%F %R';
  }
  var result = '', prev = '', got_marker = false, c, len = fmt.length;
  for (var i = 0; i < len; i++) {
    c = fmt[i];
    if (got_marker) {
      got_marker = false;
      switch (c) {
      case 'F': result += d.$fmt('%Y-%m-%d'); break;
      case 'R': result += d.$fmt('%H:%M'); break;
      case 'Y': result += d.getFullYear(); break;
      case 'y': result += d.getFullYear().toString().slice(2); break;
      case 'm': result += pad(d.getMonth() + 1); break;
      case 'd': result += pad(d.getDate()); break;
      case 'w': result += d.getDay(); break;
      case 'u': var x = d.getDay(); result += x === 0 ? 7 : x; break;
      case 'H': result += pad(d.getHours()); break;
      case 'M': result += pad(d.getMinutes()); break;
      case 'S': result += pad(d.getSeconds()); break;
      default: result += c;
      }
    }
    else if (c == '%') {
      if (prev == '%') {
        prev = '';
        result += c;
      }
      else {
        got_marker = true;
      }
    }
    else {
      result += c;
    }
    prev = c;
  }
  return result;
};
