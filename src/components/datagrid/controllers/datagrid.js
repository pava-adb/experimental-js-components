define(["jquery", "factories/view!datagrid:index.html", "factories/model!simple_model", "utils/constants", "jquery-ui", "bootstrap"], 
    function($, view, SimpleModel, Constants) {
    /**
     * # Summary
     * 
     * Datagrid provides a simple component which can present various models into a table like format.
     *
     * # Events
     *
     *  Event name | Event body | Event description
     * ---------- | ---------- | -----------------
     * datagrid:selected-row | Model object representing selected row. | Triggered whenever a datagrid row is selected.
     *
     * # Examples
     *
     * ```html
     * <!-- <custom_app>/views/index.html -->
     * <!DOCTYPE html>

        <html>
            <head>
                <title>Welcome to todo application.</title>
            </head>

            <body>
                <div data-sid="todo-app"> 
                    <div data-comp-sid="grid-tasks" data-comp-type="datagrid"></div>
                </div>
            </body>
        </html>
     * ```
     *
     * ```javascript
     * // <custom_app>/controllers/index.js
     * define(["factories/model!simple_model", "utils/constants"], function(SimpleModel, Constants) {
        function TodoApp() { };

        TodoApp.prototype.configure = function() {
            return {
                "selector": "div[data-sid='todo-app']",
                "components": {
                    "grid-tasks": {
                        "model": new SimpleModel({
                            "columns": [
                                {"id": "#", "name": "#"},
                                {"id": "firstName", "name": "First name"},
                                {"id": "lastName", "name": "Last name"}
                            ],
                            "items": [
                                new SimpleModel({"#": "1", "firstName": "Radu Viorel", "lastName": "Cosnita"}),
                                new SimpleModel({"#": "2", "firstName": "Dan", "lastName": "Popa"}),
                                new SimpleModel({"#": "3", "firstName": "Adriana Elena", "lastName": "Cosnita"})
                            ]
                        })
                    }
                }
            };
        };

        TodoApp.prototype.start = function() {
            var gridTasks = this.components["grid-tasks"];

            this._wireGridTasksEvents();
        };

        TodoApp.prototype._wireGridTasksEvents = function() {
            var gridTasks = this.components["grid-tasks"],
                self = this;

            gridTasks.on(Constants.COMPONENT_DATAGRID_ITEM_SELECTED_EVENT, function(selectedItem) {
                console.log(selectedItem);
            });
        };

        return TodoApp;
    });
     * ```
     * 
     * @public
     * @class
     * @constructor
     * @memberof UI/Components
     * @extends UI/Components.Component
     */
    function DataGrid() { };

    /**
     * This method is invoked automatically by the framework in order to give component a chance to configure itself.
     * 
     * @public
     * @method
     * @return {Object} the datagrid configuration containing only the view used for rendering.
     */
    DataGrid.prototype.configure = function() {
        return {
            "view": view
        };
    };

    /**
     * @private
     * @constant {String} This constant holds the model property name where items can be found.
     */
    DataGrid.prototype._ITEMS_MODEL_PROPERTY_NAME = "items";

    /**
     * @private
     * @constant {String} This constant holds the item index attribute name which is automatically rendered on each
     * grid row.
     */
    DataGrid.prototype._ITEM_IDX_ATTR_NAME = "data-item-index";

    /**
     * This method is invoked automatically when the datagrid is started correctly.
     * 
     * @public
     * @method
     */
    DataGrid.prototype.start = function() {
        var gridElement = $(this.config.view.element),
            model = this.config.model,
            self = this;

        this._wireConfigModelEvents(model);
        this._wireSelectItemEvent(gridElement, model);

        this.on(Constants.COMPONENT_RELOAD_EVENT, function() {
            self._wireSelectItemEvent(gridElement, model);
        });

        console.log("DataGrid started.");
    };

    /**
     * This method is used to wire select item event to the current datagrid.
     * 
     * @private
     * @method
     */
    DataGrid.prototype._wireSelectItemEvent = function(gridElement, model) {
        var self = this;

        $(gridElement.find("table")[0]).click(function(evt) {
            var target = $(evt.target),
                element = target.attr(self._ITEM_IDX_ATTR_NAME) ? target : target.parent(),
                itemIdx = element.attr(self._ITEM_IDX_ATTR_NAME);

            if (!itemIdx) {
                return;
            }

            var item = model.getData().items.get(self._ITEMS_MODEL_PROPERTY_NAME)[parseInt(itemIdx)];

            self.trigger(Constants.COMPONENT_DATAGRID_ITEM_SELECTED_EVENT, item);
        });
    };

    /**
     * This method intercepts all events emitted by the configuration model and wire them to rendering actions into datagrid.
     */
    DataGrid.prototype._wireConfigModelEvents = function(configModel) {
        var itemsModel = configModel.getData().items,
            self = this;

        configModel.getData().items = itemsModel = this._getModelFromArray(itemsModel);


        if (!itemsModel || !itemsModel.isModel()) {
            return;
        }

        itemsModel.on(Constants.MODEL_INIT_COMPLETED_EVENT, function(data) {
            self.refresh();
        });

        itemsModel.trigger(Constants.MODEL_INIT_EVENT, {});

        itemsModel.on(Constants.MODEL_INIT_FILTER_COMPLETED_EVENT, function() {
           self.refresh();
        });
    };

    /**
     * This method transforms the given itemsModel into a simple model if and only the given itemsModel is a simple array.
     * 
     * @param  {Object} itemsModel A potential array object which we want to transform into a model.
     * @return {UI/Components/Models.Model} The newly constructed model or the initial model.
     */
    DataGrid.prototype._getModelFromArray = function(itemsModel) {
        if (!(itemsModel instanceof Array)) {
            return itemsModel;
        }

        var items = [];

        if (itemsModel && itemsModel.length > 0 && itemsModel[0] instanceof SimpleModel) {
            for (var idx = 0; idx < itemsModel.length; idx++) {
                items.push(itemsModel[idx].getData());
            }
        } 

        return new SimpleModel({"items": items, "totalItemsCount": itemsModel.length});        
    };

    return DataGrid;
});