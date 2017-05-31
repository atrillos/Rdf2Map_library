(function(window) {
  'use strict'
  // Library Definition
  function defineRDF2Map(){

    // initialize
    var queryString = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \
                    PREFIX ex: <http://example.org/>  \
                    PREFIX ngeo: <http://geovocab.org/geometry#> \
                    PREFIX lgd: <http://linkedgeodata.org/ontology/> \
                    \
                    SELECT ?subject ?property ?object\
                    WHERE \
                    {\
                      ?subject ?property ?object\
                    }`

    var RDF2Map = {};

    RDF2Map.loadRDF = function (fileInputId){
      //read ttl file
      document.getElementById(fileInputId).onchange = function(){
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function(progressEvent){
          // Entire file
          var vocabulary = this.result;

          begin(vocabulary);
        };  
        reader.readAsText(file);
      };      
    }

    function begin(vocabulary){
      //print file
      console.log(vocabulary);
      // create graph store
      rdfstore.create(function(err, store) {
        store.load("text/turtle", vocabulary, function(err, results) {   
          if (err) {
            logger.debug("store load error", err);
            logger.error("Could not Run SPARQL Query:", err.message);
          } else {
            // run query
            store.execute(queryString, function(err, results) {
              // build first row
              var listOfSelects = Object.keys(results[0]);
             
              //var firstRow = "<tr>";
              var firstRow = "\ ";
              for(var key in listOfSelects)
              {
                //firstRow += "<th>" + listOfSelects[key] + "</th>";
                firstRow += listOfSelects[key] + "\ ";
              }
              //firstRow += "</tr>";
              firstRow += "\ ";
              console.log(firstRow);
              //resultTable.append(firstRow); 

              // print query results
              for (var i = 0; i < results.length; i++) {
                var resultSet = results[i];
                //console.log("resultSet: " + resultSet.value);
                //var newRow = "<tr>";
                var newRow = "\ ";
                for(var key in resultSet) { 
                  //newRow += "<td>" + resultSet[key] + "</td>";
                  newRow += resultSet[key].value + "\ ";
                }
                //newRow += "</tr>";
                newRow += "\ ";
                console.log(newRow);
                //resultTable.append(newRow)
              };
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