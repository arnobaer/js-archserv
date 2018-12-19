'use strict';

var utils = (function() {

  function len(str) {
    return str.length;
  }

  function strip(str) {
    return str.replace(/^[\s\n\r]+|\[\s\n\r]+$/gm, '');
  }

  function tokenize(str) {
    var tokens = str.split(/\s/m);
    tokens = tokens.map(strip);
    // Return only non-empty tokens.
    return tokens.filter(len);
  }

  function setw(value, size) {
    var string = value.toString();
    var padding = '0'.repeat(size - string.length);
    return padding + string;
  }

  return {
    len: len,
    strip: strip,
    tokenize: tokenize,
    setw: setw
  };

}());

export { utils };
