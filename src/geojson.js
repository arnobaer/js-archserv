'use strict';

var geojson = (function() {

  function Geometry(type, coordinates) {
    this.type = type;
    this.coordinates = coordinates;
  }

  function Feature(geometry, properties) {
    this.type = 'Feature';
    this.geometry = geometry;
    this.properties = {};
    if ((typeof properties) === 'object') {
      this.properties = properties;
    }
  }

  function FeatureCollection(features) {
    this.type = 'FeatureCollection';
    this.features = [];
    if ((typeof features) === 'object') {
      this.features = features;
    }
  }

  return {
    Geometry: Geometry,
    Feature: Feature,
    FeatureCollection: FeatureCollection
  }

}());

export { geojson };
