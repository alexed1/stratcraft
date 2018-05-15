({
    doInit: function (cmp, event, helper) { cmp.set("v.strategiesForSaving", {}) },

    loadStrategyNames: function (cmp, event, helper) { helper.loadStrategyNames(cmp, event, helper); },

    getStrategy: function (cmp, event, helper) { helper.getStrategy(cmp, event, helper); },

    createOrUpdateStrategy: function (cmp, event, helper) { helper.createOrUpdateStrategy(cmp, event, helper); },

    deleteStrategy: function (cmp, event, helper) { helper.deleteStrategy(cmp, event, helper); },

    renameStrategy: function (cmp, event, helper) { helper.renameStrategy(cmp, event, helper); },

    copyStrategy: function (cmp, event, helper) { helper.copyStrategy(cmp, event, helper); },

    convertJsonToXml: function (cmp, event, helper) { helper.convertJsonToXml(cmp, event.getParam('strategy'), event.getParam('callback')); }
})