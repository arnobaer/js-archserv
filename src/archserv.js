'use strict';

// requires proj4js

import { version } from '../package.json';
import { projection } from './projection.js';
import { geojson } from './geojson.js';
import { utils } from './utils.js';

var archserv = (function() {

  var Types = {
    measurePoint: 0,
    height: 1,
    singlePoint: 11,
    lineOpen: 2,
    lineClosed: 3,
    splineOpen: 4,
    splineClosed: 5,
    arch: 6,
    singleFind: 71,
    photogrammetryPoint: 81,
    fixedPoint: 91,
    borderOpen: 92,
    borderClosed: 93,
  };

  var PointTypes = [
    Types.measurePoint,
    Types.height,
    Types.singlePoint,
    Types.singleFind,
    Types.photogrammetryPoint,
    Types.fixedPoint,
  ];

  var LineTypes = [
    Types.lineOpen,
    Types.splineOpen,
    Types.borderOpen,
  ];

  var PolygonTypes = [
    Types.lineClosed,
    Types.splineClosed,
    Types.borderClosed,
  ];

  // Encoded point key.
  function Key(context, group, type, index) {
    this.context = parseInt(context);
    this.group = group.toUpperCase();
    this.type = parseInt(type);
    this.index = parseInt(index);
  }

  Key.prototype.toString = function() {
    var context = utils.setw(this.context, 4);
    var type = utils.setw(this.type, 2);
    var index = utils.setw(this.index, 3);
    return context + this.group + type + index;
  }

  function Point() {
    this.separator = '\t';
    this.key = '';
    this.x = 0.;
    this.y = 0.;
    this.z = 0.;
    this.code = '';
    this.isStation = false;
  }

  // Parse point from line
  Point.prototype.parse = function(line) {
    var tokens = utils.tokenize(line);
    this.key = tokens[0].toUpperCase();
    this.x = parseFloat(tokens[1]);
    this.y = parseFloat(tokens[2]);
    this.z = parseFloat(tokens[3]);
    this.code = tokens[4] ? tokens[4] : '';
    this.isStation = true;
    // Convert key to object if encoded
    if (this.key.match(/[0-9]{4}[A-Z][0-9]{5}/g)) {
      this.key = new Key(
        this.key.substr(0, 4),
        this.key.substr(4, 1),
        this.key.substr(5, 2),
        this.key.substr(7, 3)
      );
      this.isStation = false;
    }
  }

  // Return string representation
  Point.prototype.toString = function() {
    // note: force two separators after key - hence theempty string after this.key
    return [this.key, '', this.x.toFixed(3), this.y.toFixed(3), this.z.toFixed(3), this.code].join(this.separator);
  }

  function Parser() {
    this.separator = '\t';
    this.newline = '\n';
    this.result = {stations: [], features:[]};
  }

  Parser.prototype.parseLine = function(line) {
    var point;
    if (line.length) {
      point = new Point();
      point.parse(line);
      return point;
    }
  }

  Parser.prototype.parse = function(source) {
    var lines, points;
    var keys = [];
    var stations = [];
    var features = [];
    lines = source.split(this.newline);
    // Remove empty lines
    lines = lines.filter(utils.len);
    points = lines.map(this.parseLine);
    points.forEach(function (point) {
      var key, index;
      if (point.isStation) {
        stations.push(point);
      }
      else {
        key = point.key.toString().substr(0, 7);
        if (!keys.includes(key)) {
          keys.push(key);
          features.push([]);
        }
        index = keys.indexOf(key);
        features[index].push(point);
      }
    });
    this.result = {stations: stations, features: features};
  }

  Parser.prototype.toGeoJSON = function(src, dst) {
    var proj = new projection.Proj(src, dst);
    var features = [];
    this.result.stations.forEach(function(point) {
      var pos = proj.project(point);
      var geometry = new geojson.Geometry('Point', pos);
      var properties = {
        station: point.key.toString(),
        code: point.code,
      };
      features.push(new geojson.Feature(geometry, properties));
    });
    this.result.features.forEach(function(group) {
      var type = group[0].key.type;
      var buffer, geometry, properties;
      // Points
      if (PointTypes.includes(type)) {
        group.forEach(function (point) {
          var pos = proj.project(point);
          var geometry = new geojson.Geometry('Point', pos);
          var properties = {
            context: point.key.context,
            type: point.key.type,
            index: point.key.index,
            code: point.code,
          };
          features.push(new geojson.Feature(geometry, properties));
        });
      }
      // Lines
      else if (LineTypes.includes(type)) {
        buffer = group.map(function (point) {
          return proj.project(point);
        });
        geometry = new geojson.Geometry('LineString', buffer);
        properties = {
          context: group[0].key.context,
          type: group[0].key.type,
          code: group[0].code
        };
        features.push(new geojson.Feature(geometry, properties));
      }
      // Polygons
      else if (PolygonTypes.includes(type)) {
        buffer = group.map(function (point) {
          return proj.project(point);
        });
        buffer.push(buffer[0]); // close polygon
        geometry = new geojson.Geometry('Polygon', [buffer]);
        properties = {
          context: group[0].key.context,
          type: group[0].key.type,
          code: group[0].code
        };
        features.push(new geojson.Feature(geometry, properties));
      }
      else {
        console.log("unsupported type: " + group[0].key.type);
      }
    });
    return new geojson.FeatureCollection(features);
  }

  return {
    Types: Types,
    PointTypes: PointTypes,
    LineTypes: LineTypes,
    PolygonTypes: PolygonTypes,
    Parser: Parser
  }

}());

export default archserv;
