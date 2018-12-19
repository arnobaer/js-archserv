# js-archserv

Javascript ArchServ parser

## Build

```bash
$ npm update
$ npm run build
```

## Quick start

To view an ArchServ file just open `file://test/index.html` in a web browser.

## Usage

```html
<!-- include Proj4js dependency -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.5.0/proj4.js"></script>
<script src="dist/archserv.js"></script>
<script>
  // Parse ArchServ source
  var parser = new archserv.Parser();
  parser.parse(source);

  // Access station points
  parser.result.stations.forEach(function(point) {
    console.log(point);
  });

  // Access parsed feature groups
  parser.result.features.forEach(function(group) {
    group.forEach(function(point) {
      console.log(point);
    });
  });

  // Generate projected GeoJSON
  var object = parser.toGeoJSON('EPSG:31256', 'EPSG:4326');
  console.log(object);
</script>
```
