
// Encoded point key.
function ArchServKey(context, group, code, index) {
  this.context = parseInt(context);
  this.group = group.toUpperCase();
  this.code = parseInt(code);
  this.index = parseInt(index);

  // Return string representation
  this.toString = function() {
    function format(value, size) {
      var string = value.toString();
      var padding = '0'.repeat(size - string.length);
      return padding + string;
    }
    var context = format(this.context, 4);
    var code = format(this.code, 2);
    var index = format(this.index, 3);
    return context + this.group + code + index;
  }
}

function ArchServPoint() {
  this.separator = "\t";
  this.key = "";
  this.x = 0.;
  this.y = 0.;
  this.z = 0.;
  this.code = "";
  this.is_station = false;

  // Returns tuple containing XYZ coordinates of point.
  this.xyz = function() {
    return [this.x, this.y, this.z]
  }

  this.load = function(tokens) {
    this.key = tokens[0].toUpperCase();
    this.x = parseFloat(tokens[1]);
    this.y = parseFloat(tokens[2]);
    this.z = parseFloat(tokens[3]);
    this.code = tokens[4] ? tokens[4] : "";
    this.is_station = true;
    // Convert key to object if encoded
    if (this.key.match(/[0-9]{4}[A-Z][0-9]{5}/g)) {
      this.key = new ArchServKey(
        this.key.substr(0, 4),
        this.key.substr(4, 1),
        this.key.substr(5, 2),
        this.key.substr(7, 3)
      );
      this.is_station = false;
    }
  }

  // Return string representation
  this.toString = function() {
    // note: force two separators after key - hence theempty string after this.key
    return [this.key, '', this.x.toFixed(3), this.y.toFixed(3), this.z.toFixed(3), this.code].join(this.separator);
  }
}

function ArchServParser() {
  this.separator = "\t";
  this.newline = "\n";
  this.result = {};

  // Also removes carriage returns
  this.strip = function(string) {
    return string.replace(/^[\s\n\r]+|\[\s\n\r]+$/gm, '');
  }

  // tokenize input line
  this.tokenize = function(line) {
    var values = this.strip(line).replace(/ /g, this.separator).split(this.separator);
    var tokens = [];
    for (var i = 0; i < values.length; ++i) {
      var token = this.strip(values[i]);
      if (token.length) {
        tokens.push(token);
      }
    }
    return tokens;
  }

  this.parse = function(source) {
    this.result = {property: []};
    var lines = source.split(this.newline);
    for (var i = 0; i < lines.length; ++i) {
      var tokens = this.tokenize(lines[i]);
      if (tokens.length) {
        var point = new ArchServPoint();
        point.load(tokens);
        console.log(point);
        this.result.property.push(point);
      }
    }
  }
}
