'use strict';

// Requires proj4js

var projection = (function() {

  // Projection conversion
  var Proj = function(src, dst) {
    this.init(src, dst);
  }

  // Initialze projection
  Proj.prototype.init = function(src, dst) {
    switch (typeof src) {
      case 'undefined': throw "missing source projection";
      case 'string': this.src = proj(src); break;
      default: this.src = src; break;
    }
    switch (dst) {
      case 'undefined': this.dst = proj4('EPSG:4326'); break;
      case 'string': this.dst = proj(dst); break;
      default: this.dst = dst; break;
    }
  }

  // Project point coordinates (x,y,z)
  Proj.prototype.project = function(point) {
    var pos = proj4(this.src, this.dst, [point.x, point.y]);
    return pos.concat([point.z]);
  }

  return {
    Proj: Proj
  };

}());

export { projection };
