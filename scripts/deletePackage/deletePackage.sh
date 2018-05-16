if [[ $# -eq 0 ]] ; then
    echo 'You need to pass in an org alias'
    exit 1
fi

echo 'Removing tabs'
sfdx force:mdapi:deploy --deploydir ./scripts/deletePackage/deleteTabs/ -u $1 -w 5
echo 'Removing permission set assignments'
sfdx force:apex:execute -f ./scripts/deletePackage/removePermissionset.apex -u $1
echo 'Removing permission set, Lightning, Apex and static resources'
sfdx force:mdapi:deploy --deploydir ./scripts/deletePackage/deleteEverythingElse -u rutherford@gs0.org -w 5 -g

$SHELL