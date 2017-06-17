const hapi = require('hapi');
const Inert = require('inert');
//const Lout = require('lout');
//const Vision = require('vision');
//const Routes = require('./routes');

var config = {};
var server = new hapi.Server(config);
const portToUse = process.env.PORT || 5000;
server.connection({ port: ~~process.env.PORT || 5000, host: '0.0.0.0' });
server.register([Inert], (err) => {

    if (err) {
        console.error('Failed loading plugins');
        process.exit(1);
    }
	
    server.route({
        path: "/resources/{path*}",
        method: "GET",
        handler: {
        directory: {
            path: "./resources",
            listing: false,
            index: false
        }
    }});
    
    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply.file('RDF2Map.html');
        }
    });

    server.start(() => {

        console.log('Server running at:', server.info.uri);
    });
});
