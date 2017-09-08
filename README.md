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

```html
<script type="text/javascript" src="resources/rdf2map.js"></script>
```

It is important that you also import the
[RDFStore](https://github.com/antoniogarrote/rdfstore-js), [Leaflet](http://leafletjs.com)
and [Leaflet Marker Cluster](https://github.com/Leaflet/Leaflet.markercluster)
scripts before RDF2Map since the library depends on this other libraries, you can
include the scripts copying them into your project or using their respective
CDN.

```html
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
```html
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
```html
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
RDF2Map.processPaths(myStore)
  .then((myPathsMarkersList) => {
      // do something
  })
```

## Turtle Files

In general, RDF2Map is able to work with any Turtle Files, but since
 [RDFStore](https://github.com/antoniogarrote/rdfstore-js) only works with SPARQL
 1.0, some considerations must be done.

 In order to process point markers and Icons, you can specify the location of them
 with the latitude and longitude, the name, the homepage and the depiction as well.

 ```turtle
@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .
@prefix ex: <http://example.org/> .
@prefix ngeo: <http://geovocab.org/geometry#> .
@prefix lgd: <http://linkedgeodata.org/ontology/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:example ngeo:Geometry geo:Point;
  foaf:name "San Cristobal";
  foaf:homepage "http://alcaldiadesancristobal.com/";
  geo:lat "7.745627";
  geo:long "-72.215066".

ex:example2 ngeo:Geometry lgd:Icon;
  foaf:name "Haltestelle Pariser Strasse";
  geo:lat "50.7551657";
  geo:long "7.0769269";
  foaf:depiction "http://i.imgur.com/9xgY08t.png".

 ```

 For external reachable concepts you only need to specify its `ngeo:Geometry` and
 *RDF2Map* will do the rest.

 ```turtle
@prefix dbr:	<http://dbpedia.org/resource/> .
@prefix geo:	<http://www.w3.org/2003/01/geo/wgs84_pos#> .
@prefix ngeo:	<http://geovocab.org/geometry#> .
dbr:Germany	ngeo:Geometry	geo:Icon .
dbr:Ghana	ngeo:Geometry	geo:Point .
 ```

 Regarding polygons and paths, it is important to specify their location points
 in an ordered ngeo:posList that uses blank nodes.

 ```turtle
@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .
@prefix ngeo: <http://geovocab.org/geometry#> .
@prefix ex: <http://example.org/resources/> .
@prefix lgd: <http://linkedgeodata.org/ontology/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix dbc: <http://dbpedia.org/page/Category> .

ex:Polygon1 ngeo:Geometry ngeo:Polygon;
  dbc:Color "Green";
  foaf:name "Hofgarten";
  foaf:homepage "";
  ngeo:posList _:blank1, _:blank2, _:blank3, _:blank4.
  _:blank1 geo:lat "50.7342023"; geo:long "7.1042202".  
  _:blank2 geo:lat "50.732454"; geo:long "7.1019723".
  _:blank3 geo:lat "50.7310443"; geo:long "7.1047357".
  _:blank4 geo:lat "50.7328772"; geo:long "7.1065424".

ex:path foaf:name "path from Lisbon to Berlin";
  ngeo:Geometry lgd:Path ;
  dbc:Color "blue";
  ngeo:posList _:b01, _:b02, _:b03, _:b04.
  _:b01 geo:long	"-9.142685"; geo:lat "38.736946".
  _:b02 geo:long	"-8.629932"; geo:lat "41.150223".
  _:b03 geo:long	"2.294694"; geo:lat "48.858093".
  _:b04 geo:long	"13.404954"; geo:lat "52.520008".
 ```


## Tests

RDF2Map comes with a set of functional tests built in mocha. To run them please
install all the node dependencies first:

```bash
npm install
```

Then you can just simply execute the tests writing:

```bash
npm test
```



## Contributors:
* Ana Cristina Trillos Ujueta
* Jaime Manuel Trillos Ujueta
* Luis Daniel Fernandes Rotger
