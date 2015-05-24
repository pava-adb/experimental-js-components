define(["jquery", "factories/view!dropdown:index.html", "utils/constants"], function($, view, Constants) {
    /**
     * # Summary
     * 
     * Dropdown component allowing user to display various items and selected them.
     *
     * # Events
     *
     * Event name | Event body | Event description
     * ---------- | ---------- | -----------------
     * dd:selected-item | Model object representing selected item. | Triggered whenever a dropdown item is selected.
     *
     * # Model events
     *
     * Event name | Event body | Event description
     * ---------- | ---------- | -----------------
     * model:change | {"property": "title"} | Whenever the model sends a title change event the dropdown component updates the title.
     * 
     * @public
     * @class
     * @constructor
     * @memberof UI/Components
     */
    function DropDown() { 
        this.config = {
            "view": view
        }

        console.log("DropDown controller instantiated.");
    };

    /**
     * This method implements the logic executed when the component is fully started.
     * 
     * @public
     * @method
     */
    DropDown.prototype.start = function() {
        var model = this.config.model,
            self = this;

        this._bindDropDownEvents();

        this.on(Constants.COMPONENT_RELOAD_EVENT, function() {
            self._bindDropDownEvents();
        });

        model.on(Constants.MODEL_PROPERTY_CHANGE_EVENT, function(changeData) {
            if (changeData.property !== "title") {
                return;
            }

            self.refresh();
        });

        console.log("DropDown component started.");        
    };

    /**
     * This method binds drop down events to the dom element and transform them to high level component events.
     * 
     * @private
     * @method
     */
    DropDown.prototype._bindDropDownEvents = function() {
        var model = this.config.model,
            view = this.config.view,
            domElement = view.element,
            ddElem = domElement.find("button[data-sid='dropdown']").dropdown(),
            self = this;

        domElement.find(".dropdown").find(".dropdown-menu").each(function(idx, itemElem) {
            $(itemElem).click(function(evt) {
                var elem = $(evt.target),
                    idx = elem.attr("data-index"),
                    itemModel = model.getData().items[idx];

                self.trigger(Constants.COMPONENT_DD_ITEM_SELECTED_EVENT, itemModel);
                model.set("selectedItem", itemModel);
                model.set("title", itemModel[self.config.textName]);
            });
        });
    };

    return DropDown;
});