#!/bin/bash -x
echo "Generating MDAPI package"

rm -r mdapi
sfdx force:source:convert -d mdapi
cd mdapi
zip -r foozip .