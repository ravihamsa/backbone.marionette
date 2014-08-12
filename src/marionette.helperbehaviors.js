var Behaviors = {
    AnchorActions:Marionette.Behavior.extend({
        events: {
            'click a.action': 'triggerActionEvents'
        },
        triggerActionEvents: function(e){
            e.preventDefault();
            var target = $(e.target);
            var action = target.attr('href').substr(1);
            this.view.triggerMethod('action',action);
            this.view.triggerMethod('action:'+action);
        }
    })
};

Marionette.Behaviors.behaviorsLookup = function() {
    return Behaviors;
};
