(function(window) {
  'use strict'
  // Library Definition
  function defineRDF2Map(){

    // initialize
    let queryString = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \
                    PREFIX ex: <http://example.org/>  \
                    PREFIX ngeo: <http://geovocab.org/geometry#> \
                    PREFIX lgd: <http://linkedgeodata.org/ontology/> \
                    \
                    SELECT ?subject ?lat ?long\
                    WHERE \
                    {\
                      ?subject rdf:type geo:Point;
                      ngeo:posList ?position.\
                      ?position geo:lat ?lat;\
                      geo:long ?long.\
                    }`

    // THIS QUERY IS NOT CORRECT!!!
    let queryString2 = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \
                    PREFIX ex: <http://example.org/>  \
                    PREFIX ngeo: <http://geovocab.org/geometry#> \
                    PREFIX lgd: <http://linkedgeodata.org/ontology/> \
                    \
                    SELECT ?lat ?long\
                    WHERE \
                    {\
                      ?place ngeo:posList ?posList.\
                      ?posList geo:lat ?lat.\
                      ?posList geo:long ?long.\
                    }` 
    let RDF2Map = {};

    RDF2Map.loadRDF = function (fileInputId){
      //read ttl file
      document.getElementById(fileInputId).onchange = function(){
        let file = this.files[0];
        let reader = new FileReader();
        reader.onload = function(progressEvent){
          // Entire file
          var vocabulary = this.result;

          begin(vocabulary);
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

    function begin(vocabulary){

      // create graph store
      rdfstore.create(function(err, store) {
        store.load("text/turtle", vocabulary, function(err, results) {   
          if (err) {
            logger.debug("store load error", err);
            logger.error("Could not Run SPARQL Query:", err.message);
          } else {
            // run query
            store.execute(queryString, function(err, results) {
              mymap.remove();
              let newMap = L.map('mapid').setView([results[0]['lat'].value, results[0]['long'].value], 13);

              L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                  '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                  'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                id: 'mapbox.streets'
              }).addTo(newMap);

              for(let i = 0; i < results.length; i++){
                let marker = L.marker([results[i].lat.value, results[i].long.value]).addTo(newMap).bindPopup(results[i].subject.value);
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
