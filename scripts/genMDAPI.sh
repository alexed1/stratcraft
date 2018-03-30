#!/bin/bash -x
echo "Generating MDAPI package"

rm -r mdapi
sfdx force:source:convert -d mdapi
cd mdapi
sleep .2
zip -r foozip .