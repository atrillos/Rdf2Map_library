(function(window) {
  'use strict'
  // Library Definition
  function defineRDF2Map(){

    // initialize    
    let RDF2Map = {
      vocabulary: null,
      map: null
    };

    //atrillos
    RDF2Map.preLoadRDFData = function (fileInputId,map) {
      let preLoadQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \
                PREFIX ex: <http://example.org/>  \
                PREFIX ngeo: <http://geovocab.org/geometry#> \
                PREFIX lgd: <http://linkedgeodata.org/ontology/> \
                PREFIX dcterms: <http://purl.org/dc/terms/>\
                PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                PREFIX dbr:  <http://dbpedia.org/resource/> \
                \
                SELECT ?subject ?geometry\
                WHERE \
                {\
                  ?subject ngeo:Geometry ?geometry.\
                  FILTER NOT EXISTS { \
                    ?subject ngeo:posList ?posList. \
                   }\
                   FILTER NOT EXISTS { \
                    ?subject geo:lat ?lat. \
                   }\
                   
                }`
      RDF2Map.map = map;
      let mapid = RDF2Map.map._container.id;
      //read ttl file
      document.getElementById(fileInputId).onchange = function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onload = function(progressEvent){
          // Entire file
          let vocabulary = this.result;
          rdfstore.create(function(err, preLoadStore) {
            preLoadStore.load("text/turtle", vocabulary, function(err, results) {   
              if(err){
                console.log("Error preLoading data:",err);
              }else{
                preLoadStore.execute(preLoadQuery, function (err, preLoadConcepts) {
                  console.log("Concepts in ttl file: ",preLoadConcepts);                    
                  getInfoSubjects(preLoadConcepts,mapid);  
                });
              }
            });
          });
        };  
        reader.readAsText(file);
      };       
    }


    RDF2Map.loadRDF = function (fileInputId, map) {
      RDF2Map.map = map;
      //read ttl file
      document.getElementById(fileInputId).onchange = function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onload = function(progressEvent){
          // Entire file
          this.vocabulary = this.result;
          addLocationPoints(this.vocabulary);

        };  
        reader.readAsText(file);
      };      
    }

    function printResults(results){
      // print query results
      for (let i = 0; i < results.length; i++) {
        let resultSet = results[i];
        let newRow = "\ ";
        for(let key in resultSet) { 
          if(resultSet[key] == null){
            newRow += "null" + "\ ";
          }else {
            newRow += resultSet[key].value + "\ ";
          }
        }
        newRow += "\ ";
        console.log(newRow);
      }
    }

    function transformTurtle(turtle) {
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('–', '-');
      return turtle;
    }

    //trillos
    function getInfoSubjects(preLoadConcepts,mapid) {
      let geoConcepts = new Array();
      let xhr = new Array();
      let getLatLongQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \
                PREFIX ex: <http://example.org/>  \
                PREFIX ngeo: <http://geovocab.org/geometry#> \
                PREFIX lgd: <http://linkedgeodata.org/ontology/> \
                PREFIX dcterms: <http://purl.org/dc/terms/>\
                PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                PREFIX dbr:  <http://dbpedia.org/resource/> \
                \
                SELECT ?subject ?name ?lat ?long ?depiction ?homepage\
                WHERE \
                {\
                  ?subject rdfs:label ?name;\
                  geo:lat ?lat;\
                  geo:long ?long;\
                  foaf:depiction ?depiction;\
                  foaf:homepage ?homepage.\
                  FILTER (lang(?name)= 'en')
                }`
      
      for(let i = 0; i < preLoadConcepts.length; i++){
        (function(i){
          xhr[i] = new XMLHttpRequest();
          xhr[i].open('GET', preLoadConcepts[i].subject.value, true);
          xhr[i].setRequestHeader("Accept", "text/turtle");
          xhr[i].onreadystatechange = () => {
            if (xhr[i].readyState == XMLHttpRequest.DONE) {
              var remoteGraph = transformTurtle(xhr[i].responseText);
              rdfstore.create(function(err, store2) { 
                store2.load('text/turtle', remoteGraph, function(err, results) {
                  if(err){
                    console.log("Not working...",err);
                  }else{
                    //console.log(remoteGraph);
                    store2.execute(getLatLongQuery, function (err, concepts) {                        
                      console.log("After request and store.execute: ",concepts);
                      switch(preLoadConcepts[i].geometry.value){
                        case 'http://www.w3.org/2003/01/geo/wgs84_pos#Point':
                          drawMarkers(concepts,mapid);
                          break;
                        case 'http://geovocab.org/geometry#Polygon': 
                          drawPolygon(concepts,mapid);
                          break;
                        case 'http://linkedgeodata.org/ontology/Icon':
                          drawIcons(concepts,mapid);
                          break;
                        case 'http://linkedgeodata.org/ontology/Path':
                          drawPath(concepts,mapid);
                          break;
                      }
                    });
                  }
                });
              });
            }
          }
          xhr[i].send(null);
        })(i);
      } 

    }
    
    //trillos
    function drawMarkers(concepts, mapid) {
      //return new Promise ((resolve, reject) => {

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
          maxZoom: 50,
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
          id: 'mapbox.streets'
        }).addTo(RDF2Map.map);

        console.log(concepts);
        let markers = [];
        // Chunked Loading enabled for performance
        for (let i = 0; i < concepts.length; i++) {
          let popup = "<b>"+concepts[i].name.value+"</b><br><a href='"+concepts[i].homepage.value+"' target='_blank'>"+concepts[i].homepage.value+"</a>";
          /*if (results[i].link != null) {
            popup = popup+"<br><a href='"+results[i].link.value+"' target='_blank'>"+results[i].link.value+"</a>";
          }
          if(results[i].extraInfo != null) {
            popup += "<br>"+results[i].extraInfo.value;
          }
          
          popup += '<br><center><button type="button" ' + 'value="' + results[i].subject.value + '">Show More</button></center>';*/

          let marker = L.marker([concepts[i].lat.value, concepts[i].long.value]).bindPopup(popup).addTo(mymap);
          markers.push(marker);
        }
        // Uncomment for debugging.
        // printResults(results);
        //resolve(markers);
        
      
      //});
    }
    //trillos
    function drawIcons(concepts, mapid) {
      //return new Promise ((resolve, reject) => {
        // run query
        //store.execute(queryString, function (err, results) {

          L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 50,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
              '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
          }).addTo(RDF2Map.map);

          //Define dimensions of specific icon type
          var customIcon = L.Icon.extend({
            options: {
                iconSize:     [30, 30],
                popupAnchor:  [0, -7]
            }
          });
          
          let markers = [];

          // Chunked Loading enabled for performance
          for(let i = 0; i < concepts.length; i++){
            let marker;
            let popup = "<b>"+concepts[i].name.value+"</b><br><a href='"+concepts[i].homepage.value+"' target='_blank'>"+concepts[i].homepage.value+"</a>";
            /*if (results[i].link != null) {
              popup = popup+"<br><a href='"+results[i].link.value+"' target='_blank'>"+results[i].link.value+"</a>";
            }  
            if (results[i].extraInfo != null) {
              popup += "<br>"+results[i].extraInfo.value;
            }
            popup += '<br><center><button type="button" ' + 'value="' + results[i].subject.value + '">Show More</button></center>';
            popup += '<br><img src="spinner.gif">';*/

            
            marker = L.marker([concepts[i].lat.value, concepts[i].long.value], {icon: new customIcon({iconUrl: concepts[i].depiction.value})}).bindPopup(popup).addTo(mymap);
            
            markers.push(marker);
          }

          // Uncomment for debugging.
          // printResults(results);
          //resolve(markers);
        //});
      //});
    }
    //trillos
    function drawPolygon(concepts, mapid) {
      //return new Promise( (resolve, reject) => {
        // run query
        //store.execute(queryString, function (err, results) {
          
          L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 50,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
              '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
          }).addTo(RDF2Map.map);
          let polygons = [];
          let popup;
          // Grouping the coordinates by polygon
          for(let i = 0; i < concepts.length; i++) {
            let name = concepts[i].name.value;
            if (!polygons[name]) {
              polygons[name] = [];
            }
            let latlong = [concepts[i].lat.value, concepts[i].long.value];
            popup = "<b>"+concepts[i].name.value+"</b><br><a href='"+concepts[i].homepage.value+"' target='_blank'>"+concepts[i].homepage.value+"</a>";
            polygons[name].push(latlong);
            console.log(concepts[i].lat.value, concepts[i].long.value)
          }

          let markers = [];
          for (let polygonName in polygons) {
            
            let marker = L.polygon(polygons[polygonName]).addTo(RDF2Map.map).bindPopup(popup).addTo(mymap);
            markers.push(marker);
          }

          //resolve(markers);
          // Uncomment for debugging.
          //printResults(results);
        //});
      //});
    }
    //trillos
    function drawPath(concepts, mapid) {                   
      //return new Promise( (resolve, reject) => {
        // run query
        //store.execute(queryString, function (err, results) {
          
          L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 50,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
              '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
          }).addTo(RDF2Map.map);
          let popup;
        
          let pointsPath = [];
          let markers = [];
          let point = [];
          for (var i = 0; i < concepts.length; i++) 
          {            
            popup = "<b>"+concepts[i].name.value+"</b><br><a href='"+concepts[i].homepage.value+"' target='_blank'>"+concepts[i].homepage.value+"</a>";
            point = [concepts[i].lat.value, concepts[i].long.value];
            pointsPath.push(point);
            console.log(pointsPath);
            /*if(concepts[i].color != null)
            {
              var marker = L.polyline(concepts, {color: concepts[i].color.value}).addTo(RDF2Map.map).bindPopup(popup).addTo(mymap);
            } else{
              var marker = L.polyline(concepts).addTo(RDF2Map.map).bindPopup(popup);
            }  */ 

          }
          let marker = L.polyline(pointsPath).addTo(mymap).bindPopup(popup);                       
          markers.push(marker);
          
          //resolve(markers);
          // Uncomment for debugging.
          //printResults(results);
        //});
      //});
    }

    //function for markers
    function processMarkers(queryString, store, mapid) {
      return new Promise ((resolve, reject) => {
          // run query
        store.execute(queryString, function (err, results) {

          L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 50,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
              '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
          }).addTo(RDF2Map.map);
          let markers = [];
          // Chunked Loading enabled for performance
          for (let i = 0; i < results.length; i++) {
            let popup = "<b>"+results[i].name.value+"</b>";
            if (results[i].link != null) {
              popup = popup+"<br><a href='"+results[i].link.value+"' target='_blank'>"+results[i].link.value+"</a>";
            }
            if(results[i].extraInfo != null) {
              popup += "<br>"+results[i].extraInfo.value;
            }
            
            popup += '<br><center><button type="button" ' + 'value="' + results[i].subject.value + '">Show More</button></center>';

            let marker = L.marker([results[i].lat.value, results[i].long.value]).bindPopup(popup);
            markers.push(marker);
          }
          // Uncomment for debugging.
          // printResults(results);
          resolve(markers);
        });
        
      
      });
    }
    
    //function for icons
    function processIcons(queryString, store, mapid) {
      return new Promise ((resolve, reject) => {
        // run query
        store.execute(queryString, function (err, results) {

          L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 50,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
              '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
          }).addTo(RDF2Map.map);

          //Define dimensions of specific icon type
          var customIcon = L.Icon.extend({
            options: {
                iconSize:     [30, 30],
                popupAnchor:  [0, -7]
            }
          });
          
          let markers = [];

          // Chunked Loading enabled for performance
          for(let i = 0; i < results.length; i++){
            let marker;
            let popup = "<b>"+results[i].name.value+"</b>";
            if (results[i].link != null) {
              popup = popup+"<br><a href='"+results[i].link.value+"' target='_blank'>"+results[i].link.value+"</a>";
            }  
            if (results[i].extraInfo != null) {
              popup += "<br>"+results[i].extraInfo.value;
            }
            popup += '<br><center><button type="button" ' + 'value="' + results[i].subject.value + '">Show More</button></center>';
            popup += '<br><img src="spinner.gif">';

            if(results[i].iconURL == null) {
              marker = L.marker([results[i].lat.value, results[i].long.value], {icon: new customIcon({iconUrl: results[i].typeIcon.value})}).bindPopup(popup);
            } else {
              marker = L.marker([results[i].lat.value, results[i].long.value], {icon: new customIcon({iconUrl: results[i].iconURL.value})}).bindPopup(popup);
            }
            markers.push(marker);
          }

          // Uncomment for debugging.
          // printResults(results);
          resolve(markers);
        });
      });
    }

    //function for polygons
    function processPolygon(queryString, store, mapid) {
      return new Promise( (resolve, reject) => {
        // run query
        store.execute(queryString, function (err, results) {
          
          L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 50,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
              '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
          }).addTo(RDF2Map.map);
          let polygons = {};

          // Grouping the coordinates by polygon
          for(let i = 0; i < results.length; i++) {
            let name = results[i].name.value;
            if (!polygons[name]) {
              polygons[name] = [];
            }
            let latlong = [results[i].lat.value, results[i].long.value];
            polygons[name].push(latlong);
          }

          let markers = [];
          for (let polygonName in polygons) {
            let popup = "<b>" + polygonName + "</b>";
            let marker = L.polygon(polygons[polygonName]).addTo(RDF2Map.map).bindPopup(popup);
            markers.push(marker);
          }

          resolve(markers);
          // Uncomment for debugging.
          //printResults(results);
        });
      });
    }

    function addLocationPoints(vocabulary) {

      let queryPoints = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \
                PREFIX ex: <http://example.org/>  \
                PREFIX ngeo: <http://geovocab.org/geometry#> \
                PREFIX lgd: <http://linkedgeodata.org/ontology/> \
                PREFIX dcterms: <http://purl.org/dc/terms/>\
                PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                PREFIX dbr:  <http://dbpedia.org/resource/> \
                \
                SELECT ?subject ?name ?lat ?long ?extrainfo ?link\
                WHERE \
                {\
                  ?subject rdfs:label ?name;\
                  ngeo:Geometry geo:Point;\
                  geo:lat ?lat;\
                  geo:long ?long.\
                  OPTIONAL{?subject rdfs:comment ?extraInfo} \
                  OPTIONAL{?subject foaf:homepage ?link}\
                }`

      let queryIcons = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \
                PREFIX ex: <http://example.org/>  \
                PREFIX ngeo: <http://geovocab.org/geometry#> \
                PREFIX lgd: <http://linkedgeodata.org/ontology/> \
                PREFIX dcterms: <http://purl.org/dc/terms/>\
                PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                \
                SELECT ?subject ?name ?lat ?long ?type ?typeIcon ?iconURL ?link ?extrainfo\
                WHERE \
                {\
                  ?subject ngeo:Geometry lgd:Icon;\
                  rdf:type ?type;\
                  rdfs:label ?name;\
                  geo:lat ?lat;\
                  geo:long ?long.\
                  ?type ex:hasIcon ?typeIcon.\
                  OPTIONAL{?subject foaf:depiction ?iconURL}\
                  OPTIONAL{?subject rdfs:comment ?extraInfo} \
                  OPTIONAL{?subject foaf:homepage ?link} \
                }`

      let polygonsQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \
                PREFIX ex: <http://example.org/>  \
                PREFIX ngeo: <http://geovocab.org/geometry#> \
                PREFIX lgd: <http://linkedgeodata.org/ontology/> \
                PREFIX dcterms: <http://purl.org/dc/terms/>\
                PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                \
                SELECT ?subject ?name ?lat ?long\
                WHERE \
                {\
                  ?subject ngeo:Geometry ngeo:Polygon;
                  rdfs:label ?name;\
                  ngeo:posList ?position.\
                  ?position geo:lat ?lat;\
                  geo:long ?long.\
                  OPTIONAL{?subject rdfs:comment ?extraInfo} \
                  OPTIONAL{?subject foaf:homepage ?link} \
                }`

        let pathQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \
                PREFIX ex: <http://example.org/>  \
                PREFIX ngeo: <http://geovocab.org/geometry#> \
                PREFIX lgd: <http://linkedgeodata.org/ontology/> \
                PREFIX dcterms: <http://purl.org/dc/terms/>\
                PREFIX dbpedia: <http://dbpedia.org/ontology/>\
                \
                SELECT ?subject ?lat ?long ?color\
                WHERE \
                {\
                  ?subject ngeo:Geometry lgd:Path;\
                  dbpedia:Colour ?color;\
                  ngeo:posList ?posList.\
                  ?posList geo:lat ?lat;\
                  geo:long ?long.\
                }`

        let getSubjects = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \
                PREFIX ex: <http://example.org/>  \
                PREFIX ngeo: <http://geovocab.org/geometry#> \
                PREFIX lgd: <http://linkedgeodata.org/ontology/> \
                PREFIX dcterms: <http://purl.org/dc/terms/>\
                PREFIX dbpedia: <http://dbpedia.org/ontology/>\
                SELECT ?subject\
                WHERE \
                {\
                  ?subject ?property ?object.\
                }`

      // create graph store
      rdfstore.create(function(err, store) {
        store.load("text/turtle", vocabulary, function(err, results) {   
          if (err) {
            console.log("store load error", err);
            console.log("Could not Run SPARQL Query:", err.message);
          } else {
            
            let mapid = RDF2Map.map._container.id;
            //RDF2Map.map.remove();
            //RDF2Map.map = L.map(mapid).setView([50.7374, 7.0982], 13);
            
            let promises = [];
            promises.push(processMarkers(queryPoints, store, mapid)); 
            promises.push(processIcons(queryIcons, store, mapid));
            promises.push(processPolygon(polygonsQuery, store, mapid)); 
            Promise.all(promises).then((res) => {
              
              let markers = res.reduce((a, b) => {
                return a.concat(b);
              });

              // Create the clusters
              let clusters = L.markerClusterGroup({chunckedLoading: true});
              for (let i = 0; i < markers.length; i = i + 1) {
                clusters.addLayer(markers[i]);
              }

              // Add clusters to map.
              RDF2Map.map.addLayer(clusters);
              
              // Bounds fixed for markers
              let markerGroup = new L.featureGroup(markers);
              
              if (markers.length > 1){
                RDF2Map.map.fitBounds(markerGroup.getBounds());  
              }
              
            });
          }
        });
      });
    }
  
    return RDF2Map;
  }

  if (typeof(RDF2Map) === 'undefined') {
    window.RDF2Map = defineRDF2Map();
  }
})(window);