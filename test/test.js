let assert = require('assert');
let rdfstore = require('rdfstore');
let fs = require('fs');
let jsdom = require('jsdom');
let rdf2map = require('../resources/rdf2map.js');
const { JSDOM } = jsdom;
const { Script } = require('vm');


console.log(rdf2map);
describe('RDF2Map', () => {
	describe('#indexOf()', (suite) => {		
		let s = null;
		let dom = null;
		let window = null;
		let rdfstore = null;
		let rdf2map = null;
		let RDF2Map = null;
		let leaflet = null;
		let lmc = null;

		before((done) => {
			console.log(rdf2map);
			fs.readFile('./resources/rdf2map.js', 'utf8', (err, data) => {
				if (err) {
					return console.error(err);
				}
				let RDF2Map = rdf2map.RDF2Map;
				s = new Script(data);
				JSDOM.fromFile('test/testhtml.html', { runScripts: 'outside-only' }).then( res => {
					dom = res;
					window = dom.window;
					done();
				});
				
			});
		});

		// RDFStore Script
		before((done) => {
			fs.readFile('./resources/rdfstore.js', 'utf8', (err, data) => {
				rdfstore = data;
				rdfstoreScript = new Script(data);
				done();
			});
		});

		// Leaflet Script
		before((done) => {
			fs.readFile('./resources/leaflet.js', 'utf8', (err, data) => {
				leaflet = data;
				done();
			});
		});

		// Rdf2map Script
		before((done) => {
			fs.readFile('./resources/rdf2map.js', 'utf8', (err, data) => {
				rdf2map = data;
				done();
			});
		});

		// leaflet marker clusters Script
		before((done) => {
			fs.readFile('./resources/leaflet.markercluster.js', 'utf8', (err, data) => {
				lmc = data;
				lmc = new Script(lmc);
				done();
			});
		});

		it('Should retrieve information from external accessible resources', () => {
			
			let info = rdf2map.getInfoSubjects(["http://dbpedia.org/resource/Germany", "http://dbpedia.org/resource/Bonn"]);
			console.log(info);
			//dom.runVMScript(rdfstore);	
			//console.log(lmc);
			//console.log(dom.serialize());

/*			
			console.log('//////');
			console.log(dom.serialize());
			console.log('////');
			console.log(s);
			*/
			assert.equal(-1, [1,2,3].indexOf(9));
			
		});
	});
});
