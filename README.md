# RDF2Map

RDF2Map is a Javascript library that provides a set of functions to process RDF
geospatial data and show it in a [Leaflet](http://leafletjs.com) map. RDF2Map
is able to extract remote information using the uri of a concept (for example [http://dbpedia.org/resource/Germany](http://dbpedia.org/resources/Germany)) and
use its coordinates to display the concept in a map. As a developer you can also
create your own geospatial concepts but you need to specify at least a name and
its coordinates so it can be displayed in the map. RDF2Map currently only supports
Turtle files. In the Turtle Files directory of this repository you can find some
examples files you can use for RDF2Map.

## Installation and Dependencies

To use RDF2Map you only have to import the RDF2Map script in the HTML file where
you want to show the map.

```
<script type="text/javascript" src="resources/rdf2map.js"></script>
```

It is important that you also import the
[RDFStore](https://github.com/antoniogarrote/rdfstore-js), [Leaflet](http://leafletjs.com)
and [Leaflet Marker Cluster](https://github.com/Leaflet/Leaflet.markercluster)
scripts before RDF2Map since the library depends on this other libraries, you can
include the scripts copying them into your project or using their respective
CDN.

```
<script type="text/javascript" src="resources/rdfstore.js"></script>
<script type="text/javascript" src="resources/leaflet.js"></script>
<link rel="stylesheet" type="text/css" href="resources/leaflet.css">
<link rel="stylesheet" type="text/css" href="resources/styles.css">
<link rel="stylesheet" type="text/css" href="resources/MarkerCluster.css">
<link rel="stylesheet" type="text/css" href="resources/MarkerCluster.Default.css">
<script type="text/javascript" src="resources/leaflet.markercluster.js"></script>
<script type="text/javascript" src="resources/rdf2map.js"></script>
```

Once you've done these two simple steps you can start to use RDF2Map!

## API

#### bindFileInput

This function will bind a file input and a map of your HTML file, so you can upload
a turtle file and it will process all the possible geospatial concepts and display
their information in the map. You only need to provide the file input id, the
leaflet map and an optional boolean argument *refresh* that will refresh the
map if it is set to *true*, otherwise the map will accumulate the geospatial
information.

Example:
```
<div id="mapid" style="width: 100%; height: 80%;"></div>
<input class='inputfile' accept='.ttl' type='file' id='file'>
<script>
  let mymap = L.map('mapid').setView([50.7374, 7.0982], 13);
  RDF2Map.bindFileInput('file', mymap);
</script>
```

### loadInMap

Given a turtle vocabulary as a string and a leaflet map, it will load the
turtle information in to the map, you can also specify a *refresh* boolean
parameter that will delete previous information to the map if it is set to *true*.

Example:
```
<script>
  let myTurtleString = {someStringWithTurtleInformation}
  let mymap = L.map('mapid').setView([50.7374, 7.0982], 13);
  RDF2Map.loadInMap(myTurtleString, mymap);
</script>
```

### getInfoSubjects

It will return a turtle string with remote information related to a list of subjects
given a a parameter, this function will send a *XMLHttpRequest* and will provide
a turtle graph with the name, latitude and longitude of the subjects, it will also provide
some information such as depiction (<http://xmlns.com/foaf/0.1/depiction>) and
homepage (<http://xmlns.com/foaf/0.1/homepage>)) if the geospatial concept have it.

Example:

```
let mySubjectArray = [
    'http://dbpedia.org/resource/Germany',
    'http://dbpedia.org/resource/Colombia',
    'http://dbpedia.org/resource/Venezuela'
  ];

let myGraph = RDF2Map.getInfoSubjects(mySubjectArray);
```

### processPoints

Receives a loaded rdfstore and return return a promise that resolve the respective
leaflet markers of all the points (<http://www.w3.org/2003/01/geo/wgs84_pos#Point>)
in a list.

Example:

```
RDF2Map.processPoints(myStore)
  .then((myPointsMarkersList) => {
      // do something
  })
```

### processIcons

Receives a loaded rdfstore and return return a promise that resolve the respective
leaflet markers of all the icons (<http://linkedgeodata.org/ontology/Icon>)
in a list.

Example:

```
RDF2Map.processIcons(myStore)
  .then((myIconsMarkersList) => {
      // do something
  })
```

### processPolygons

Receives a loaded rdfstore and return return a promise that resolve the respective
leaflet markers of all the Polygons (<http://geovocab.org/geometry#Polygon>)
in a list.

Example:

```
RDF2Map.processPolygons(myStore)
  .then((myPolygonsMarkersList) => {
      // do something
  })
```

### processPaths

Receives a loaded rdfstore and return return a promise that resolve the respective
leaflet markers of all the paths (<http://linkedgeodata.org/ontology/Path>)
in a list.

Example:

```
RDF2Map.processPaths(myStore)
  .then((myPathsMarkersList) => {
      // do something
  })
```

## Tests

RDF2Map comes with a set of functional tests built in mocha. To run them please
install all the node dependencies first:

```
npm install
```

Then you can just simply execute the tests writing:

```
npm test
```
