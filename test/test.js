// Imports of assert, rdfstore, fs and rdf2map.
let assert = require('assert');
let rdfstore = require('rdfstore');
let fs = require('fs');
let rdf2map = require('../resources/rdf2map.js').RDF2Map;

// Create globals so leaflet can load
global.window = {
	screen: {
		deviceXDPI: 1,
		logicalXDPI: 1
	}
};
global.document = {
  	documentElement: {
		style: {}
	},
	getElementsByTagName: function() { return []; },
	createElement: function() { return {}; }
};
global.navigator = {
  userAgent: 'nodejs',
  platform: []
};
// Import leaflet
let L = require('leaflet');

describe('RDF2Map', () => {

	it('Should create markers for location points.', () => {
		// Read test file
		fs.readFile('./Turtle\ Files/VzlaCities.ttl', 'utf8', (err, data) => {
			// Create the store
		   	rdfstore.create((err, store) => {
		   		// Load data in store
		   		store.load('text/turtle', data, (err, res) => {
		   			if (err) {
		   				console.log('Error loading turtle file', err);
		   			}
					rdf2map.processMarkers(store).then((res) => {
						assert.equal(10, res.length);
					});
		   		});
		   	});
        });		
	});

	it('Should create Icon markers for location points.', () => {
		// Read test file
		fs.readFile('./Turtle\ Files/icons.ttl', 'utf8', (err, data) => {
			// Create the store
		   	rdfstore.create((err, store) => {
		   		// Load data in store
		   		store.load('text/turtle', data, (err, res) => {
		   			if (err) {
		   				console.log('Error loading turtle file', err);
		   			}
					rdf2map.processIcons(store).then((res) => {
						assert.equal(8, res.length);
					});
		   		});
		   	});
        });
	});

	it('Should create Polygons for location areas.', () => {
		// Read test file
		fs.readFile('./Turtle\ Files/polygons.ttl', 'utf8', (err, data) => {
			// Create the store
		   	rdfstore.create((err, store) => {
		   		// Load data in store
		   		store.load('text/turtle', data, (err, res) => {
		   			if (err) {
		   				console.log('Error loading turtle file', err);
		   			}
					rdf2map.processPolygons(store).then((res) => {
						assert.equal(4, res.length);
					});
		   		});
		   	});
        });
	});

	it('Should create Paths for location areas.', () => {
		// Read test file
		fs.readFile('./Turtle\ Files/paths.ttl', 'utf8', (err, data) => {
			// Create the store
		   	rdfstore.create((err, store) => {
		   		// Load data in store
		   		store.load('text/turtle', data, (err, res) => {
		   			if (err) {
		   				console.log('Error loading turtle file', err);
		   			}
					rdf2map.processPaths(store).then((res) => {
						assert.equal(3, res.length);
					});
		   		});
		   	});
        });
	});

	it('Should create the exact amount of different geo Concepts.', () => {
		// Read test file
		fs.readFile('./Turtle\ Files/map.ttl', 'utf8', (err, data) => {
			// Create the store
		   	rdfstore.create((err, store) => {
		   		// Load data in store
		   		store.load('text/turtle', data, (err, res) => {
		   			if (err) {
		   				console.log('Error loading turtle file', err);
		   			}
					rdf2map.processMarkers(store).then((res) => {
						assert.equal(2, res.length);
					});
					rdf2map.processIcons(store).then((res) => {
						assert.equal(5, res.length);
					});
					rdf2map.processPolygons(store).then((res) => {
						assert.equal(1, res.length);
					});
					rdf2map.processPaths(store).then((res) => {
						assert.equal(1, res.length);
					});
		   		});
		   	});
        });
    });

    it('Should create no markers if there is no marker in the file.', () => {
		// Read test file
		fs.readFile('./Turtle\ Files/icons.ttl', 'utf8', (err, data) => {
			// Create the store
		   	rdfstore.create((err, store) => {
		   		// Load data in store
		   		store.load('text/turtle', data, (err, res) => {
		   			if (err) {
		   				console.log('Error loading turtle file', err);
		   			}
					rdf2map.processPaths(store).then((res) => {
						assert.equal(0, res.length);
					});
				});
	   		});
	   	});
    });

    it('Should create no icons if there is no Icons in the file.', () => {
		// Read test file
		fs.readFile('./Turtle\ Files/VzlaCities.ttl', 'utf8', (err, data) => {
			// Create the store
		   	rdfstore.create((err, store) => {
		   		// Load data in store
		   		store.load('text/turtle', data, (err, res) => {
		   			if (err) {
		   				console.log('Error loading turtle file', err);
		   			}
					rdf2map.processIcons(store).then((res) => {
						assert.equal(0, res.length);
					});
	   			});
	   		});
    	});
    });

    it('Should create no polygons if there is no polygons in the file.', () => {
		// Read test file
		fs.readFile('./Turtle\ Files/VzlaCities.ttl', 'utf8', (err, data) => {
			// Create the store
		   	rdfstore.create((err, store) => {
		   		// Load data in store
		   		store.load('text/turtle', data, (err, res) => {
		   			if (err) {
		   				console.log('Error loading turtle file', err);
		   			}
					rdf2map.processPolygons(store).then((res) => {
						assert.equal(0, res.length);
					});
				});
	   		});
	   	});
    });

    it('Should create no paths if there is no paths in the file.', () => {
		// Read test file
		fs.readFile('./Turtle\ Files/VzlaCities.ttl', 'utf8', (err, data) => {
			// Create the store
		   	rdfstore.create((err, store) => {
		   		// Load data in store
		   		store.load('text/turtle', data, (err, res) => {
		   			if (err) {
		   				console.log('Error loading turtle file', err);
		   			}
					rdf2map.processPaths(store).then((res) => {
						assert.equal(0, res.length);
					});
				});
	   		});
	   	});
    });
});
