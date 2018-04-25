({
    handleInit: function (cmp, event, helper) {
        helper.updateSelectableNodes(cmp);
        helper.handlePriorityButtons(cmp);
    },

    handleCurrentNodeChanged: function (cmp, event, helper) {
        helper.updateSelectableNodes(cmp);
    },


    handlePriorityChange: function (cmp, event, helper) {
        var isUp = event.getParam('destination') == 'up';
        var branches = cmp.get('v.currentNode.branches');
        var currentItem = event.getSource().get('v.currentItem');
        var index = branches.indexOf(currentItem);
        var newIndex = isUp ? index - 1 : index + 1;
        //swapping
        var tmp = branches[newIndex];
        branches[newIndex] = currentItem;
        branches[index] = tmp;
        cmp.set('v.currentNode.branches', branches);
        helper.handlePriorityButtons(cmp);
    },

    handleMemberAdd: function (cmp, event, helper) {

        var memberType = cmp.get('v.memberType');

        switch (memberType) {

            case 'filter':
                var branches = cmp.get('v.currentNode.branches');

                if (!branches) {
                    branches = [];
                }
                var selectableNodes = cmp.get('v.selectableNodes');
                branches.push(
                    {
                        child: selectableNodes.length == 0 ? null : selectableNodes[0],
                        expression: 'true'
                    });
                cmp.set('v.currentNode.branches', branches);
                break;

            case 'sort':
                var sortKeys = cmp.get('v.currentNode.sortKeys');

                if (!sortKeys) {
                    sortKeys = [];
                }

                sortKeys.push(
                    {
                        name: '',
                        nullsFirst: false,
                        order: 'Desc'
                    });
                cmp.set('v.currentNode.sortKeys', sortKeys);
                break;

            case 'externalConnection':
                var argPairs = cmp.get('v.currentNode.argPairs');

                if (!argPairs) {
                    argPairs = [];
                }

                argPairs.push(
                    {
                        name: '',
                        value: ''
                    });
                cmp.set('v.currentNode.argPairs', argPairs);
                break;
        }

        helper.handlePriorityButtons(cmp);
    },

    handleMemberDelete: function (cmp, event, helper) {
        var memberType = cmp.get('v.memberType');

        switch (memberType) {

            case 'filter':
                var branches = cmp.get('v.currentNode.branches');
                var currentItem = event.getSource().get('v.currentItem');
                var index = branches.indexOf(currentItem);
                branches.splice(index, 1);
                cmp.set('v.currentNode.branches', branches);
                break;

            case 'sort':
                var sortKeys = cmp.get('v.currentNode.sortKeys');
                var currentItem = event.getSource().get('v.currentItem');
                var index = sortKeys.indexOf(currentItem);
                sortKeys.splice(index, 1);
                cmp.set('v.currentNode.sortKeys', sortKeys);
                break;

            case 'argumentPair':
                var argPairs = cmp.get('v.currentNode.argPairs');
                var currentItem = event.getSource().get('v.currentItem');
                var index = argPairs.indexOf(currentItem);
                argPairs.splice(index, 1);
                cmp.set('v.currentNode.argPairs', argPairs);
                break;

        }

        helper.handlePriorityButtons(cmp);
    }
})
