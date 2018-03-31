({
    handleInit: function (component, event, helper) {
        helper.updateSelectableNodes(component);
    },

    handleCurrentNodeChanged: function (component, event, helper) {
        helper.updateSelectableNodes(component);
    },

    handleMemberAdd: function (component, event, helper) {

        var memberType = component.get('v.memberType');

        switch(memberType) {

            case 'filter':
                var branches = component.get('v.currentNode.branches');

                if (!branches) {
                    branches = [];
                }
                var selectableNodes = component.get('v.selectableNodes');
                branches.push(
                {
                    child: selectableNodes.length == 0 ? null : selectableNodes[0],
                    expression: 'true'
                });
                component.set('v.currentNode.branches', branches);
            break;

            case 'sort':
               var sortKeys = component.get('v.currentNode.sortKeys');

                if (!sortKeys) {
                    sortKeys = [];
                }
                
                sortKeys.push(
                {
                    property: '',
                    direction: 'asc'
                });
                component.set('v.currentNode.sortKeys', sortKeys);
            break;

            case 'externalConnection':
                var argPairs = component.get('v.currentNode.argPairs');

                if (!argPairs) {
                    argPairs = [];
                }
                
                argPairs.push(
                {
                    name: '',
                    value: ''
                });
                component.set('v.currentNode.argPairs', argPairs);
            break;
        }
       
    },

    handleMemberDelete: function (component, event, helper) {
        var memberType = component.get('v.memberType');

        switch(memberType) {

            case 'filter':
                var branches = component.get('v.currentNode.branches');
                var currentItem = event.getSource().get('v.currentItem');
                var index = branches.indexOf(currentItem);
                branches.splice(index, 1);
                component.set('v.currentNode.branches', branches);
            break;

            case 'sort':
                var sortKeys = component.get('v.currentNode.sortKeys');
                var currentItem = event.getSource().get('v.currentItem');
                var index = sortKeys.indexOf(currentItem);
                sortKeys.splice(index, 1);
                component.set('v.currentNode.sortKeys', sortKeys);
            break;

            case 'argumentPair':
                var argPairs = component.get('v.currentNode.argPairs');
                var currentItem = event.getSource().get('v.currentItem');
                var index = argPairs.indexOf(currentItem);
                argPairs.splice(index, 1);
                component.set('v.currentNode.argPairs', argPairs);
            break;

        }

        
    }
})
