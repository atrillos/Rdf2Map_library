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

    function addLocationPoints(vocabulary) {
      let generalQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \
                PREFIX ex: <http://example.org/>  \
                PREFIX ngeo: <http://geovocab.org/geometry#> \
                PREFIX lgd: <http://linkedgeodata.org/ontology/> \
                PREFIX dcterms: <http://purl.org/dc/terms/>\
                PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                \
                SELECT ?subject ?name ?lat ?long ?type ?geometry ?imageUrl ?extraInfo ?link\
                WHERE \
                {\
                  ?subject ngeo:Geometry ?geometry;\
                  rdf:type ?type;\
                  dcterms:title ?name.\
                  OPTIONAL{?subject ngeo:posList ?posList} \
                  OPTIONAL{?subject rdfs:comment ?extraInfo} \
                  OPTIONAL{?subject foaf:homepage ?link} \
                  OPTIONAL{?subject geo:lat ?lat; geo:long ?long}\
                  OPTIONAL{?subject foaf:depiction ?imageUrl}\
                }`

      let polygonQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \
                PREFIX ex: <http://example.org/>  \
                PREFIX ngeo: <http://geovocab.org/geometry#> \
                PREFIX lgd: <http://linkedgeodata.org/ontology/> \
                PREFIX dcterms: <http://purl.org/dc/terms/>\
                \
                SELECT ?subject ?lat ?long\
                WHERE \
                {\
                  ?subject ngeo:Geometry ngeo:Polygon;\
                  ngeo:posList ?posList.\
                  ?posList geo:lat ?lat;\
                  geo:long ?long.\
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

      // create graph store
      rdfstore.create(function(err, store) 
      {
        store.load("text/turtle", vocabulary, function(err, results) 
        {   
          if (err) 
          {
            alert("store load error");
            //alert("Could not Run SPARQL Query:");
            logger.debug("store load error", err);
            logger.error("Could not Run SPARQL Query:", err.message);
          } else 
          {
            let mapid = RDF2Map.map._container.id;
            RDF2Map.map.remove();
            RDF2Map.map = L.map(mapid).setView([50.7374, 7.0982], 13);
            
            let markers = [];
            let bounds = [];
            let latlong = [];
            store.execute(generalQuery, function (err, results) 
            {
              if (err) 
              {
                //alert("store load error");
                alert("Could not Run SPARQL Query:");
                logger.debug("store load error", err);
                logger.error("Could not Run SPARQL Query:", err.message);
              } else 
              {
                L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
                  maxZoom: 50,
                  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                  id: 'mapbox.streets'
                }).addTo(RDF2Map.map);

                var customIcon = L.Icon.extend
                ({
                  options: {
                    iconSize:     [30, 30],
                    popupAnchor:  [0, -7]
                  }
                });

                for(let i = 0; i < results.length; i++)
                {
                  let popup = "<b>"+results[i].name.value+"</b>";
                  
                  switch(results[i].geometry.value)
                  {
                    //Markers
                    case 'http://www.w3.org/2003/01/geo/wgs84_pos#Point':                    
                      if(results[i].link != null)
                      {
                        popup = popup+"<br><a href='"+results[i].link.value+"' target='_blank'>"+results[i].link.value+"</a>";
                      }  
                      if(results[i].extraInfo != null)
                      {
                        popup += "<br>"+results[i].extraInfo.value;
                      } 
                      var marker = L.marker([results[i].lat.value, results[i].long.value]).addTo(RDF2Map.map).bindPopup(popup);
                      markers.push(marker);
                      latlong = [results[i].lat.value, results[i].long.value];
                      bounds.push(latlong);
                      break;

                    //Icons
                    case 'http://linkedgeodata.org/ontology/Icon':                    
                      if(results[i].link != null)
                      {
                        popup = popup+"<br><a href='"+results[i].link.value+"' target='_blank'>"+results[i].link.value+"</a>";
                      }  
                      if(results[i].extraInfo != null)
                      {
                        popup += "<br>"+results[i].extraInfo.value;
                      } 
                      if(results[i].imageUrl == null)
                      {
                        var marker = L.marker([results[i].lat.value, results[i].long.value]).addTo(RDF2Map.map).bindPopup(popup);
                        markers.push(marker);
                      } else{
                        var marker = L.marker([results[i].lat.value, results[i].long.value], {icon: new customIcon({iconUrl: results[i].imageUrl.value})}).addTo(RDF2Map.map).bindPopup(popup);
                        markers.push(marker);
                      }
                      latlong = [results[i].lat.value, results[i].long.value];
                      bounds.push(latlong);
                      break;
                       
                    //Polygons
                    case 'http://geovocab.org/geometry#Polygon':

                      if(results[i].link != null)
                      {
                        popup = popup+"<br><a href='"+results[i].link.value+"' target='_blank'>"+results[i].link.value+"</a>";
                      }  
                      if(results[i].extraInfo != null)
                      {
                        popup += "<br>"+results[i].extraInfo.value;
                      }


                      store.execute(polygonQuery, function (err, polygons) 
                      {
                        if (err) 
                        {
                          //alert("store load error");
                          alert("Could not Run SPARQL Query:");
                          logger.debug("store load error", err);
                          logger.error("Could not Run SPARQL Query:", err.message);
                        } else 
                        {
                          var posPoly = [];

                          for (var j = 0; j < polygons.length; j++) 
                          {
                            let poly = [];
                            if(results[i].subject.value == polygons[j].subject.value)
                            {
                              poly = [polygons[j].lat.value, polygons[j].long.value];
                              posPoly.push(poly);
                              bounds.push(poly);
                            }
                          }
                          var marker = L.polygon(posPoly).addTo(RDF2Map.map).bindPopup(popup);
                          markers.push(marker);
                          RDF2Map.map.fitBounds(bounds);
                        }
                      });
                      break;

                  }
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
              }
              printResults(results);

              if (markers.length > 1) {
                let boundaries = new L.LatLngBounds(bounds);
                RDF2Map.map.fitBounds(bounds);  
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
