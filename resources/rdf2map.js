(function(window) {
  'use strict'
  // Library Definition
  function defineRDF2Map(){

    // initialize    
    let RDF2Map = {
      vocabulary: null,
      map: null,
      store: null
    };

    /*
      Function to load the elements of the file into the map.
      Input: mapId, fileInputId, refresh (set to true if you don't want to keep previous layers)
    */
    RDF2Map.loadRDF = function (fileInputId, map, refresh = false) {

      RDF2Map.map = map;

      //read ttl file
      document.getElementById(fileInputId).onchange = function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onload = function(progressEvent){
          // If refresh is enabled, just remove the previous map keeping the same center.
          if (refresh) {
            let center = RDF2Map.map.getCenter();
            RDF2Map.map.remove();
            RDF2Map.map = L.map(mapid).setView([center.lat, center.lng], 13);
          }
          // Entire file
          this.vocabulary = transformTurtle(this.result);
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

    // Function to replace characters that are unreadable by the rdfstore
    function transformTurtle(turtle) {
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('–', '-');
      turtle = turtle.replace('‘', '');
      turtle = turtle.replace('‘', '');
      turtle = turtle.replace('‘', '');
      turtle = turtle.replace('‘', '');
      turtle = turtle.replace('‘', '');
      return turtle;
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
            let popup = "<b>"+results[i].name.value+"</b><br><a href='"+results[i].homepage.value+"' target='_blank'>"+results[i].homepage.value+"</a>";
            /*let popup = "<b>"+results[i].name.value+"</b>";
            if (results[i].link != null) {
              popup = popup+"<br><a href='"+results[i].link.value+"' target='_blank'>"+results[i].link.value+"</a>";
            }
            if(results[i].extraInfo != null) {
              popup += "<br>"+results[i].extraInfo.value;
            }*/

            let marker = L.marker([results[i].lat.value, results[i].long.value]).bindPopup(popup);
            markers.push(marker);
          }
          // Uncomment for debugging.
          // printResults(results);
          resolve(markers);
        });
        
      
      });
    }

    function getInfoSubjects(subjects) {

      return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
          if (xhr.readyState == XMLHttpRequest.DONE) {
            let remoteGraph = xhr.responseText;
            remoteGraph = transformTurtle(remoteGraph);
            
            resolve(remoteGraph);
          }
        }

        // Construction of the concepts string to add it to the query
        let concepts = '';
        for (let i = 0; i < subjects.length; i++) { 
          concepts = concepts + '<' + subjects[i] + '>';
          if (i != subjects.length - 1) {
            concepts = concepts + ' ';
          }
        }


        // Query to send to dbpedia
        let query = `
          prefix dbo: <http://dbpedia.org/ontology/>
          prefix ngeo: <http://geovocab.org/geometry#>
          prefix dbr: <http://dbpedia.org/resource/>

          CONSTRUCT { 
            ?concept foaf:name ?name;
              geo:lat ?lat; 
              geo:long ?long;
              foaf:depiction ?depiction;
              foaf:homepage ?homepage.
          } WHERE {
            VALUES ?concept {` + concepts + `}
            ?concept geo:lat ?lat;
              foaf:name ?name;
              geo:long ?long;
              foaf:depiction ?depiction;
              foaf:homepage ?homepage.
            FILTER(langMatches(lang(?name), "en"))
          }
        `;

        // Setting uri to be requested (dbpedia)
        let uri = "http://dbpedia.org/sparql/";

        xhr.open('POST', uri, true);
        // Setting header of the request
        xhr.setRequestHeader("Accept", "text/turtle");

        // Creation of the request body.
        let request_body = new FormData();
        request_body.append('query', query);
        request_body.append('format', 'text/turtle');
        request_body.append('default-graph-uri', 'http://dbpedia.org');
        request_body.append('timeout', 3000000);
        request_body.append('debug', 'on');
        request_body.append('run', 'Run Query');
        
        // Send the request
        xhr.send(request_body);

      });
    }

    //function for icons
    function processIcons(queryString, store, mapid) {
      return new Promise ((resolve, reject) => {
        // run query
        store.execute(queryString, function (err, results) {
          //console.log(results);
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
            let popup = "<b>"+results[i].name.value+"</b><br><a href='"+results[i].homepage.value+"' target='_blank'>"+results[i].homepage.value+"</a>";
            /*let popup = "<b>"+results[i].name.value+"</b>";
            if (results[i].link != null) {
              popup = popup+"<br><a href='"+results[i].link.value+"' target='_blank'>"+results[i].link.value+"</a>";
            }  
            if (results[i].extraInfo != null) {
              popup += "<br>"+results[i].extraInfo.value;
            }*/
            marker = L.marker([results[i].lat.value, results[i].long.value], {icon: new customIcon({iconUrl: results[i].depiction.value})}).bindPopup(popup);
            /*if(results[i].iconURL == null) {
              marker = L.marker([results[i].lat.value, results[i].long.value], {icon: new customIcon({iconUrl: results[i].typeIcon.value})}).bindPopup(popup);
            } else {
              marker = L.marker([results[i].lat.value, results[i].long.value], {icon: new customIcon({iconUrl: results[i].iconURL.value})}).bindPopup(popup);
            }*/
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
              polygons[name] = {
                'color': results[i].color.value,
                'latlng': [],
                'homepage': results[i].homepage.value
              };
            }
            let latlong = [results[i].lat.value, results[i].long.value];
            polygons[name]['latlng'].push(latlong);
          }          

          let markers = [];
          for (let polygonName in polygons) {
            //let popup = "<b>"+polygonName+"</b><br><a href='"+results[i].homepage.value+"' target='_blank'>"+results[i].homepage.value+"</a>";
            let popup = "<b>" + polygonName + "</b><br><a href='"+ polygons[polygonName]['homepage'] +"' target='_blank'>"+ polygons[polygonName]['homepage'] +"</a>";
            let marker = L.polygon(polygons[polygonName]['latlng'], {color: polygons[polygonName]['color']}).addTo(RDF2Map.map).bindPopup(popup);
            markers.push(marker);
          }

          resolve(markers);
          // Uncomment for debugging.
          //printResults(results);
        });
      });
    }

    //function for paths
    function processPath(queryString, store, mapid) {
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
          let paths = {};

          // Grouping the coordinates by polygon
          for(let i = 0; i < results.length; i++) {
            let name = results[i].name.value;
            // let homepage = results[i].homepage.value;
            // let colorTxt = results[i].color.value;
            if (!paths[name]) {
              paths[name] = [];
            }
            let latlong = [results[i].lat.value, results[i].long.value];
            paths[name].push(latlong);
          }
          let markers = [];
          for (let pathName in paths) {            
            //popup = "<b>"+pathName+"</b><br><a href='"+webpage[webpageName].homepage.value+"' target='_blank'>"+results[i].homepage.value+"</a>";
            let popup = "<b>" + pathName + "</b>";
            let marker = L.polyline(paths[pathName], {color: "red"}).addTo(RDF2Map.map).bindPopup(popup);
            markers.push(marker);
            
          }
          resolve(markers);
          // Uncomment for debugging.
          //printResults(results);
        });
      });
    }

  // Function that return the subjects in the store.
  function getSubjects(store) {
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
                SELECT ?subject ?type\
                WHERE \
                {\
                  ?subject ngeo:Geometry ?type.\
               }`

        return new Promise( (resolve, reject) => {
          // Execute the query to retrieve the subjects
          store.execute(preLoadQuery, function(err, results) {
            if (err) {
              console.error(err);
              reject(err);
            }
            let res = []
            for (let i = 0; i < results.length; i++){
              // Obtain the values and store them in the res array.
              res.push(results[i].subject.value);   
            }
            resolve(res);
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
                SELECT ?subject ?name ?lat ?long ?homepage\
                WHERE \
                {\
                  ?subject foaf:name ?name;\
                    ngeo:Geometry geo:Point;\
                    geo:lat ?lat;\
                    geo:long ?long;\
                    foaf:homepage ?homepage.\
                }`

      let queryIcons = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> 
                PREFIX ex: <http://example.org/>  
                PREFIX ngeo: <http://geovocab.org/geometry#> 
                PREFIX lgd: <http://linkedgeodata.org/ontology/> 
                PREFIX dcterms: <http://purl.org/dc/terms/>
                PREFIX foaf: <http://xmlns.com/foaf/0.1/>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                
                SELECT ?subject ?name ?lat ?long ?type ?depiction ?homepage
                WHERE 
                {
                  ?subject ngeo:Geometry lgd:Icon;
                    foaf:name ?name;
                    geo:lat ?lat;
                    geo:long ?long;
                    foaf:homepage ?homepage;
                    foaf:depiction ?depiction.
                }`

      let polygonsQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> 
                PREFIX ex: <http://example.org/>  
                PREFIX ngeo: <http://geovocab.org/geometry#> 
                PREFIX lgd: <http://linkedgeodata.org/ontology/> 
                PREFIX foaf: <http://xmlns.com/foaf/0.1/>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX dbc: <http://dbpedia.org/page/Category> 
                
                SELECT ?subject ?name ?lat ?long ?homepage ?color
                WHERE 
                {
                  ?subject ngeo:Geometry ngeo:Polygon;
                    ngeo:posList ?position;
                    foaf:name ?name;
                    foaf:homepage ?homepage;
                    dbc:Color ?color.

                  ?position geo:lat ?lat;
                    geo:long ?long.        
                }`

        let pathQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> 
                PREFIX ex: <http://example.org/>  
                PREFIX ngeo: <http://geovocab.org/geometry#> 
                PREFIX lgd: <http://linkedgeodata.org/ontology/> 
                PREFIX foaf: <http://xmlns.com/foaf/0.1/>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX dbc: <http://dbpedia.org/page/Category> 
                
                SELECT ?subject ?name ?lat ?long ?homepage ?color
                WHERE 
                {
                 ?subject ngeo:Geometry lgd:Path;
                    foaf:name ?name;
                    foaf:homepage ?homepage;
                    dbc:Color ?color;
                    ngeo:posList ?position.
                  ?position geo:lat ?lat;
                    geo:long ?long.
                }`

    
      // create graph store
      rdfstore.create(function(err, store) {
        RDF2Map.store = store;
        RDF2Map.store.load("text/turtle", vocabulary, function(err, results) {   
          if (err) {
            console.log("store load error", err);
            console.log("Could not Run SPARQL Query:", err.message);
          } else {
            
            let mapid = RDF2Map.map._container.id;
            // Obtain the subjects from the file.
            getSubjects(RDF2Map.store).then((subjects) => {

              // Split the subjects in chunks of 3200 so the request doesn't exceed the limit of concepts.
              let chunk = 3200;
              let splitted_subjects_array = [];
              for (let i=0; i< subjects.length; i+=chunk) {
                let temparray = subjects.slice(i,i+chunk);
                splitted_subjects_array.push(temparray);
              }
              // 
              let promise_array = [];
              for (let i = 0; i < splitted_subjects_array.length; i++) {
                promise_array.push(getInfoSubjects(splitted_subjects_array[i]));
              }
              // get the remote information of the subjects for each chunk simultaneously. 
              // (if the subject is remotely reachable)
              return Promise.all(promise_array); //getInfoSubjects(subjects);
            }).then((turtles) => {
              
              // Once the information is obtained, load it into the store.
              RDF2Map.store.load("text/turtle", turtles.join(''), function(err, results) {
                if (err) console.error(err);

                // Process markers, Icons and Polygons.
                let promises = [];
                promises.push(processMarkers(queryPoints, store, mapid)); 
                promises.push(processIcons(queryIcons, store, mapid));
                promises.push(processPolygon(polygonsQuery, store, mapid)); 
                promises.push(processPath(pathQuery, store, mapid)); 
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
              });
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