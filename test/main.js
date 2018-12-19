// ArchServ Viewer

// Provide additional projections
proj4.defs("EPSG:31256", "+proj=tmerc +lat_0=0 +lon_0=16.33333333333333 +k=1 +x_0=0 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs");
proj4.defs("EPSG:31255", "+proj=tmerc +lat_0=0 +lon_0=13.33333333333333 +k=1 +x_0=0 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs");
proj4.defs("EPSG:31254", "+proj=tmerc +lat_0=0 +lon_0=10.33333333333333 +k=1 +x_0=0 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs");
proj4.defs("EPSG:31259", "+proj=tmerc +lat_0=0 +lon_0=16.33333333333333 +k=1 +x_0=750000 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs");
proj4.defs("EPSG:31258", "+proj=tmerc +lat_0=0 +lon_0=13.33333333333333 +k=1 +x_0=450000 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs");
proj4.defs("EPSG:31257", "+proj=tmerc +lat_0=0 +lon_0=10.33333333333333 +k=1 +x_0=150000 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs");

function reset() {
  document.getElementById('source').value = '';
  document.getElementById('geoJSON').innerText = '';
}

function parseFile(event) {
  var reader = new FileReader();
  reader.onloadend = function() {
    updateMap(reader.result);
  };
  reader.readAsText(event.target.files[0]);
}

reset(); // clear textarea

var map = L.map('map').setView([48.208490, 16.373132], 13);

L.tileLayer('https://{s}.wien.gv.at/basemap/bmapgrau/normal/google3857/{z}/{y}/{x}.png', {
  maxZoom: 26,
  minZoom: 0,
  attribution: 'Source: <a href="http://basemap.at" target="_blank">basemap.at</a>, <a href="http://creativecommons.org/licenses/by/3.0/at/deed.de" target="_blank">CC-BY 3.0</a>',
  subdomains: ['maps', 'maps1', 'maps2', 'maps3']
}).addTo(map);
L.control.scale({position: 'topright'}).addTo(map);

var group = L.featureGroup().addTo(map);

function updateMap(source) {
  var parser = new archserv.Parser();
  parser.parse(source);
  var src = proj4(document.getElementById('crs').value);
  var dst = proj4('EPSG:4326');
  var featureCollection = parser.toGeoJSON(src, src);
  var featureCollectionGoogle = parser.toGeoJSON(src, dst);
  var node = document.getElementById('source');
  node.value = '';
  parser.result.stations.forEach(function(point) {
    node.value += point + "\n";
  });
  parser.result.features.forEach(function(group) {
    group.forEach(function(point) {
      node.value += point + "\n";
    });
  });
  document.getElementById('geoJSON').innerText = JSON.stringify(featureCollection, null, '  ');
  // Remove all previous layers
  group.clearLayers();
  function markerOptions(feature) {
    var type = feature.properties.type;
    if (type === undefined) type = 0;
    return {
      radius: 8,
      color: "black",
      fillColor: {0:'grey',1:'orange',11:'blue',71:'red',81:'green',91:'magenta'}[type],
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };
  }
  group.addLayer(L.geoJSON(featureCollectionGoogle, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, markerOptions(feature));
    },
    style: function(feature) {
      switch (feature.properties.type) {
        case archserv.Types.lineOpen: return { color: "magenta" };
        case archserv.Types.lineClosed: return { color: "magenta" };
        case archserv.Types.borderOpen: return { color: "blue" };
        case archserv.Types.borderClosed: return { color: "blue" };
      }
    },
    onEachFeature: function(feature, layer) {
      if (feature.properties && feature.properties.type) {
        if (archserv.PointTypes.includes(feature.properties.type)) {
          layer.bindPopup('Context: ' + feature.properties.context + '<br/>Type: ' + feature.properties.type + '<br/>Height: ' + feature.geometry.coordinates[2] + ' m<br/>Code: ' + feature.properties.code);
        }
        else {
          layer.bindPopup('Context: ' + feature.properties.context + '<br/>Type: ' + feature.properties.type + '<br/>Code: ' + feature.properties.code);
        }
      }
      else if (feature.properties && feature.properties.code) {
        layer.bindPopup('Station: ' + feature.properties.station + '<br/>Height: ' + feature.geometry.coordinates[2] + ' m<br/>Code: ' + feature.properties.code);
      }
    }
  }));
  map.fitBounds(group.getBounds());
}

function updateCRS() {
  var key, crs;
  key = document.getElementById('crs').value;
  crs = proj4(key);
  var content = document.getElementById('source').value;
  if (content == false)
    updateMap(content);
}

function showSource() {
  document.getElementById('source').style.display = 'initial';
  document.getElementById('geoJSON').style.display = 'none';
}

function showGeoJSON() {
  document.getElementById('source').style.display = 'none';
  document.getElementById('geoJSON').style.display = 'initial';
}

document.getElementById('download').onclick = function(elem) {
  var blob = new Blob([document.getElementById('geoJSON').innerText], { type: 'application/json' });
  this.href = window.URL.createObjectURL(blob);
};
