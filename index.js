const hapi = require('hapi');
const Inert = require('inert');
//const Lout = require('lout');
//const Vision = require('vision');
//const Routes = require('./routes');

var config = {};
var server = new hapi.Server(config);
const portToUse = process.env.PORT || 5000;
console.log(portToUse);
server.connection({ port: portToUse, host: 'localhost' });
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
            console.log('ola k ase');
            reply.file('RDF2Map.html');
        }
    });

    server.start(() => {

        console.log('Server running at:', server.info.uri);
    });
});
/*
let express = require('express');
let app = express();
let path = require('path');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
//app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  //response.render('RDF2Map.html');
  response.sendFile(path.join(__dirname + '/RDF2Map.html'));
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
*/
