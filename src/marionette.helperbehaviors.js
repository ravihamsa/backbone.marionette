var Behaviors = {
    AnchorActions:Marionette.Behavior.extend({
        ui:{
            'action':'a.action'
        },
        events: {
            'click @ui.action': 'triggerActionEvents'
        },
        triggerActionEvents: function(e){
            e.preventDefault();
            if(this.ui.action.index(e.target) > -1){
                var target = $(e.target);
                var action = target.attr('href').substr(1);
                this.view.triggerMethod('action',action);
                this.view.triggerMethod('action:'+action);
            }
        }
    }),
    TriggerModelEvents:Marionette.Behavior.extend({
        modelEvents: {
            'change': 'triggerChangeEvents'
        },
        triggerChangeEvents: function(model){
            var _this = this;
            var changedAttributes = model.changedAttributes();
            _.each(changedAttributes, function(value, attributeName){
                _this.view.triggerMethod(attributeName+':change', value);
            });
            _this.view.triggerMethod('change', changedAttributes);
        }
    }),
    TriggerCollectionEvents:Marionette.Behavior.extend({
        collectionEvents: {
            'all': 'triggerCollectionEvents'
        },
        triggerCollectionEvents: function(eventName){

            var args = Array.prototype.slice.call(arguments);
            args.unshift('collectionEvent:'+eventName);
            this.view.triggerMethod.apply(this.view, args);
            args.shift();
            args.unshift('collectionEvent');
            this.view.triggerMethod.apply(this.view, args);
        }
    })
};




Marionette.Behaviors.behaviorsLookup = function() {
    return Behaviors;
};
