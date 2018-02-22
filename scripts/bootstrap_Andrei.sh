echo "Deleting existing org..."
sfdx force:org:delete -u StratCraft -p
echo "Creating new org..."
sfdx force:org:create -a StratCraft -s -f config/project-scratch-def.json -d 2
echo "Installing test package..."
sfdx force:lightning:test:install
echo "Pushing source code..."
sfdx force:source:push
echo "Importing strategies..."
sfdx force:data:tree:import  -f data/Strategy__c.json 
echo "Opening org..."
sfdx force:org:open