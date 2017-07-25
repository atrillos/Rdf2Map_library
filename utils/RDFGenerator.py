# Mode of use: python RDFGenerator.py <quantity> <type>
# where <quantity> is the ammount of objects to be generated in the ttl file.
# and <type> could be: marker , icon , polygon

import random
from os import sys


quantity = sys.argv[1]
infoType = sys.argv[2]

print quantity, infoType
# Open / create feedback.csv file
outputFile = open('example-' + infoType + '-' + quantity + '.ttl', 'w')

outputFile.write('@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .\n')
outputFile.write('@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n')
outputFile.write('@prefix ex: <http://example.org/> .\n')
outputFile.write('@prefix ngeo: <http://geovocab.org/geometry#> .\n')
outputFile.write('@prefix lgd: <http://linkedgeodata.org/ontology/> .\n')
outputFile.write('@prefix dcterms: <http://purl.org/dc/terms/>.\n')
outputFile.write('@prefix foaf: <http://xmlns.com/foaf/0.1/>.\n')
outputFile.write('@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.\n')
outputFile.write('@prefix dbpedia: <http://dbpedia.org/ontology/>.\n')
outputFile.write('\n')

if infoType == "marker":
	for i in range(int(quantity)):
		obj = 'ex:Object' + str(i) + ' rdf:type lgd:City;\n'
		obj += '\trdfs:label \"' + str(i) + '\";\n'
		obj += '\tngeo:Geometry geo:Point;\n'
		lat = random.randint(-80, 80)
		lon = random.randint(-180, 180)
		obj += '\tgeo:lat \"' + str(lat) + '\";\n'
		obj += '\tgeo:long \"' + str(lon) + '\".\n\n' 

		outputFile.write(obj)

elif infoType == 'icon':
	icons = ["http://i.imgur.com/9xgY08t.png", "http://i.imgur.com/pEAHIEr.png", "http://i.imgur.com/qV7kKnZ.png"]
	for i in range(int(quantity)):
		obj = 'ex:Object' + str(i) + ' rdf:type lgd:Station;\n'
		obj += '\tdcterms:title \"' + str(i) + '\";\n'
		obj += '\tngeo:Geometry lgd:Icon;\n'
		lat = random.randint(-80, 80)
		lon = random.randint(-180, 180)
		randIcon = random.randint(0, len(icons) - 1)
		obj += '\tfoaf:depiction \"' + icons[randIcon] + '\";\n'
		obj += '\tgeo:lat \"' + str(lat) + '\";\n'
		obj += '\tgeo:long \"' + str(lon) + '\".\n\n' 

		outputFile.write(obj)
