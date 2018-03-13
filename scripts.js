  mapboxgl.accessToken = 'pk.eyJ1Ijoibm91cmJheWFyZCIsImEiOiJjamVpZndwdnoydnM0MzNvMzRqdXBscTQ5In0.BGG90DR2d83-Qyu0oiFPQw';
  // mapbox.mapbox-streets-v7
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/basic-v9',
    center: [4.895168, 52.370216],
    zoom: 11
  });

  var sparqlquery =
    `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX hg: <http://rdf.histograph.io/>
      PREFIX dc: <http://purl.org/dc/elements/1.1/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
      PREFIX geo: <http://www.opengis.net/ont/geosparql#>
  SELECT ?building ?label ?wkt ?earliestBegin ?latestEnd WHERE {
    ?building rdf:type hg:Building .
    ?building skos:prefLabel ?label .
    ?building geo:hasGeometry ?geom .
    ?geom geo:asWKT ?wkt .
    ?building sem:hasLatestEndTimeStamp ?latestEnd .
  OPTIONAL { ?building sem:hasEarliestBeginTimeStamp ?earliestBegin . }
  } LIMIT 400`;

  var encodedquery = encodeURIComponent(sparqlquery);

  var queryurl = 'https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=' + encodedquery + '&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on';

  fetch(queryurl)
    .then((resp) => resp.json()) // transform the data into json
    .then(function(data) {
      //console.log(data)

      var rows = data.results.bindings; // get the results
      var imgdiv = document.getElementById('images');

      rows.forEach(function(data) {
        //console.log(data)
        if (data.wkt.value.toLowerCase().includes('polygon')) {
          return
        }

        thisData.features.push(data)
      });
      //console.log(thisData)

      // add markers to map
      thisData.features.forEach(function(marker) {

        // create a HTML element for each feature
        var el = document.createElement('div');
        el.className = 'marker';

        console.log(marker);
        var doc = marker.wkt.value;
        var first = doc.indexOf('4');
        var end = doc.indexOf(')');
        doc = doc.substring(first, end);

        var coordinates = doc.split(" ");
        //var geom = coordinates[0] + ' ' + coordinates[1];
        //console.log(geom);

        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup({
              offset: 25
            }) // add popups
            .setHTML('<h3>' + marker.label.value + '</h3><p>' + marker.earliestBegin.value + ' - ' + marker.latestEnd.value + '</p>'))
          .addTo(map);
      });
    })
    .catch(function(error) {
      // if there is any error you will catch them here
      console.log(error);
    });
  var thisData = {
    features: []
  }
