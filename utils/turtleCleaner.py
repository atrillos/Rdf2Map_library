# Made by Luis D. Fernandes 
# 25.07.2017
# To run this script just place the file in the same folder as this script and run:
# python turtleCleaner.py <ttlFile>

import json
from os.path import isfile, join
from os import listdir, system, sys

file = sys.argv[1]

# Open / create temp file
temp_file = open('temp.ttl', 'w')

with open(file) as f:
	for line in f:
		if "dbr:" in line:
			ind1 = line.index(':')
			ind2 = line.index('\t')
			subs = line[ind1+1:ind2]
			subs = subs.replace('\’','')
			pre = line[:ind1 + 1]
			post = line[ind2:]
			temp_file.write(pre + subs + post)
		else:
			temp_file.write(line)


temp_file.close()
bashCommand = "mv temp.ttl "+file
system(bashCommand)
