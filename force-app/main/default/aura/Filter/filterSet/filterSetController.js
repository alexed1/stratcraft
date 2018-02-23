({
    handleInit: function (component, event, helper) {
        helper.updateSelectableNodes(component);
    },

    handleCurrentNodeChanged: function (component, event, helper) {
        helper.updateSelectableNodes(component);
    },

    handleFilterAdd: function (component, event, helper) {
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
    },

    handleFilterDelete: function (component, event, helper) {
        var branches = component.get('v.currentNode.branches');
        var currentBranch = event.getSource().get('v.currentBranch');
        var index = branches.indexOf(currentBranch);
        branches.splice(index, 1);
        component.set('v.currentNode.branches', branches);
    }
})
