window._modalDialog = (function () {
    var overlay = null;
    var overlayPanels = [];

    var parseComponentConfiguration = function (configuration) {
        if (!configuration) {
            return configuration;
        }
        var result = { name: '', initializer: null };
        if (Array.isArray(configuration)) {
            result.name = configuration[0];
            result.isComponent = true;
            result.initializer = configuration[1];
        }
        else {
            result.name = configuration;
            result.isComponent = configuration.split(':').length > 1;
        }
        return result;
    };

    return {
        initialize: function (component) {
            overlay = component.find('modalDialog');
        },
        /**@param {object} header - Header of the modal window. Can be one of the following:
         * - plain string: will be displayed as is
         * - component name (starts with namespace:): specified component will be created and used
         * - array: first element of array is treated as component name, second is treated as an initializer function that accepts newly created component
         * @param {object} body - Body of the modal window. Can be one of the following:
         * - plain string: will be displayed as is
         * - component name (starts with namespace:): specified component will be created and used
         * - array: first element of array is treated as component name, second is treated as an initializer function that accepts newly created component
         * @param {function} okCallback - (Optional)Function that accepts modal body component and is invoked when modal body component passed validation and modal window is closed.
         * If it is not provided, than standard footer with 'Continue' and 'Cancel' won't be used, leaving modal window closing responsibility to the body component
         * @param {function} validateCallback - (Optional)Function that accepts modal body component and returns true if it is in a valid state to proceed
         * @param {function} cancelCallback - (Optional)Function that is invoked when modal window is closed without validation
         * @param {object} cssClass - (Optional) name of css class to be applied to modal window. 
         * @example: Examples for header and body:
         * 'This text will be shown as is'
         * 'c:myComponentName'
         * ['c:myComponentName', function (component) { component.set('v.name', 'Initial value for the name property')}]
         */
        show: function (header, body, okCallback, validateCallback, cancelCallback, cssClass) {
            if (overlay === null) {
                throw new Error('Overlay is not yet initialized. You should call "initialize" prior to it');
            }
            var headerConfiguration = parseComponentConfiguration(header);
            var bodyConfiguration = parseComponentConfiguration(body);
            var componentsToCreate = [];
            if (okCallback) {
                var packagePrefix = _utils.getPackagePrefix();
                componentsToCreate.unshift([packagePrefix + ':modalWindowFooter', {}]);
            }
            if (bodyConfiguration.isComponent) {
                componentsToCreate.unshift([bodyConfiguration.name, {}]);
            }
            if (headerConfiguration.isComponent) {
                componentsToCreate.unshift([headerConfiguration.name, {}]);
            }
            $A.createComponents(componentsToCreate,
                function (components, status, errorMessage) {
                    if (status === 'SUCCESS') {
                        if (!okCallback) {
                            components.push(undefined);
                        }
                        //Footer is always the last, body is always next to the last, header is always the first
                        var footer = components[components.length - 1];
                        header = headerConfiguration.isComponent ? components[0] : headerConfiguration.name;
                        body = bodyConfiguration.isComponent ? components[components.length - 2] : bodyConfiguration.name;

                        if (headerConfiguration.isComponent && headerConfiguration.initializer) {
                            headerConfiguration.initializer(header);
                        }
                        if (bodyConfiguration.isComponent && bodyConfiguration.initializer) {
                            bodyConfiguration.initializer(body);
                        }
                        if (footer) {
                            footer.addEventHandler('buttonClickEvent', function (clickEvent) {
                                var buttonClicked = clickEvent.getParam('Button');
                                switch (buttonClicked) {
                                    case _utils.ModalDialogButtonType.OK:
                                        var isValid = !validateCallback || validateCallback(body);
                                        if (isValid) {
                                            okCallback(body);
                                            overlay.notifyClose();
                                        }
                                        break;
                                    case _utils.ModalDialogButtonType.CANCEL:
                                        if (cancelCallback) {
                                            cancelCallback();
                                        }
                                        overlay.notifyClose();
                                        break;
                                }
                            });
                        }
                        overlay.showCustomModal({
                            header: header,
                            body: body,
                            footer: footer,
                            cssClass: cssClass,
                            closeCallback: function () {
                                overlayPanels.shift();
                            },
                            //In this case if we provide cancellation callback, we don't allow user to just close the window, as we are interested in the councious choice 
                            showCloseButton: cancelCallback === null || cancelCallback === undefined
                        }).then(function (overlay) {
                            overlayPanels.unshift({ overlay: overlay, isOpen: true });
                        });
                    }
                });
        },

        close: function () {
            //This function will be called if we try to close the dialog window from the code
            //We can be sure that the callback above will be called after this function finishes so we don't remove reference to the overlay panel here
            for (var index = 0; index < overlayPanels.length; index++) {
                var item = overlayPanels[index];
                if (item.isOpen) {
                    item.isOpen = false;
                    item.overlay.close();
                    break;
                }
            }
        }
    }
})()