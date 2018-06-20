if [[ $# -eq 0 ]] ; then
    echo 'You need to pass in an org alias'
    exit 1
fi

echo 'Removing permission set assignments'
sfdx force:apex:execute -f ./scripts/deletePackage/removePermissionset.apex -u $1

echo 'Removing top-level stuff (Application, Tabs etc)'
sfdx force:mdapi:deploy --deploydir ./scripts/deletePackage/deleteTabs/ -u $1 -w 5 -g

echo 'Removing other stuff (components, resources etc)'
sfdx force:mdapi:deploy --deploydir ./scripts/deletePackage/deleteEverythingElse -u $1 -w 5 -g

$SHELL