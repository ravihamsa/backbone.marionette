/* jshint maxlen: 134, nonew: false */
// Marionette.SelectableModel
// ---------------

var ItemModel = Marionette.Model.extend({
    defaults: {
        selectedState: 1, //selected 1, unselected 0
        showIcon: true,
        selectable:true
    },
    setSelectedState: function(selectedState){
        this.set('selectedState', selectedState);
    },
    select: function () {
        this.setSelectedState(1);
    },
    deselect: function () {
        this.setSelectedState(0);
    },
    partialSelect: function(){
        this.setSelectedState(2);
    },
    toggleSelect: function () {
        var selected = this.is('setSelectedState');
        if(selected === 1){
            this.deselect();
        }else{
            this.select();
        }
    },
    triggerSelect: function(){
        this.collection.trigger('selectItem', this);
    },
    triggerDeSelect: function(){
        this.collection.trigger('deSelectItem', this);
    },
    triggerToggleSelect: function(){
        this.collection.trigger('toggleSelectItem', this);
    },
    triggerPartialSelect: function(){
        this.collection.trigger('partialSelectItem', this);
    }
});

var ItemView = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'single-select-item',
    template: '<a href="#select" data-id="<%=id%>" class="action"><% if (showIcon){ %><em class="icon"></em><% } %> <%=name%></a>',
    behaviours:{
        AnchorActions:{}
    },
    onActionSelect:function(){
        if (this.model.is('selectable')) {
            this.model.triggerSelect();
        }
    },
    onChange: function () {
        this.render();
        this.$el.toggleClass('active', this.model.is('selected'));
        this.$el.toggleClass('disabled', this.model.isNot('selectable'));
    }
});



Marionette.Selectable = {
    ItemModel:ItemModel,
    ItemView:ItemView
};
