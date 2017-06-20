(function(window) {
  'use strict'
  // Library Definition
  function defineRDF2Map(){

    // initialize    
    let RDF2Map = {
      vocabulary: null,
      map: null
    };

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
          newRow += resultSet[key].value + "\ ";
        }
        newRow += "\ ";
        console.log(newRow);
      }
    }

    function addLocationPoints(vocabulary) {

      let queryString = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \
                PREFIX ex: <http://example.org/>  \
                PREFIX ngeo: <http://geovocab.org/geometry#> \
                PREFIX lgd: <http://linkedgeodata.org/ontology/> \
                PREFIX dcterms: <http://purl.org/dc/terms/>\
                \
                SELECT ?name ?lat ?long\
                WHERE \
                {\
                  ?subject rdf:type geo:Point;
                  dcterms:title ?name;\
                  ngeo:posList ?position.\
                  ?position geo:lat ?lat;\
                  geo:long ?long.\
                }`

      // create graph store
      rdfstore.create(function(err, store) {
        store.load("text/turtle", vocabulary, function(err, results) {   
          if (err) {
            logger.debug("store load error", err);
            logger.error("Could not Run SPARQL Query:", err.message);
          } else {
            // run query
            store.execute(queryString, function (err, results) {
              let mapid = RDF2Map.map._container.id;
              RDF2Map.map.remove();
              RDF2Map.map = L.map(mapid).setView([results[0]['lat'].value, results[0]['long'].value], 13);

              L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
                maxZoom: 50,
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                  '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                  'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                id: 'mapbox.streets'
              }).addTo(RDF2Map.map);

              let markers = [];
              for(let i = 0; i < results.length; i++){
                let marker = L.marker([results[i].lat.value, results[i].long.value]).addTo(RDF2Map.map).bindPopup(results[i].name.value);
                markers.push(marker);
                // build first row
                let listOfSelects = Object.keys(results[0]);
               
                //var firstRow = "<tr>";
                let firstRow = "\ ";
                for(let key in listOfSelects)
                {
                  //firstRow += "<th>" + listOfSelects[key] + "</th>";
                  firstRow += listOfSelects[key] + "\ ";
                }
                //firstRow += "</tr>";
                firstRow += "\ ";
                console.log(firstRow);
                //resultTable.append(firstRow); 
              }

              // Create a marker group with all the markers
              let markerGroup = new L.featureGroup(markers);
              // Fit the map to the markers bounds.
              RDF2Map.map.fitBounds(markerGroup.getBounds());
              printResults(results);
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
