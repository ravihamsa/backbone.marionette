/* jshint maxlen: 134, nonew: false */
// Marionette.SelectableModel
// ---------------

var ItemModel = Marionette.Model.extend({
    defaults: {
        selected: false, //selected 1, unselected 0
        showIcon: true,
        selectable:true
    },
    select: function () {
        this.set('selected', true);
    },
    deselect: function () {
        this.set('selected', false);
    },
    toggleSelect: function () {
        var selected = this.is('selected');
        if(selected){
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
    className: 'list-item',
    getTemplate:function(){
        return Marionette.templateLookup('selectable.item');
    },
    behaviors:{
        AnchorActions:{},
        TriggerModelEvents:{}
    },
    onActionSelect:function(){
        if (this.model.is('selectable')) {
            this.model.triggerSelect();
        }
    },
    onChange: function () {
        this.syncSelection();
    },
    onShow: function(){
        this.syncSelection();
    },
    syncSelection: function(){
        this.$el.toggleClass('active', this.model.is('selected'));
        this.$el.toggleClass('disabled', this.model.isNot('selectable'));
    }
});


var SingleSelectItemView = ItemView.extend({

});

var MultiSelectItemView = ItemView.extend({
    onActionSelect: function(){
        if (this.model.is('selectable')) {
            this.model.triggerToggleSelect();
        }
    }
});

var SingleSelectCollection = Backbone.Collection.extend({
    model:ItemModel
});



var MultiSelectCollection = Backbone.Collection.extend({
    model:ItemModel
});


var SingleSelectModel = Marionette.Model.extend({
    constructor: function(){
        this._selected = null;
        Marionette.Model.apply(this, arguments);
        this.listCollection = this.getOption('items') || new SingleSelectCollection();
        this.setupSelection();
    },
    resetItems: function(array){
        this.listCollection.reset(array);
        this.readSelection();
    },
    setupSelection: function(){
        var _this = this;
        var coll = _this.listCollection;
        _this.listenTo(coll, 'selectItem', function(model){
            if(this._selected){
                this._selected.deselect();
            }
            this.setSelected(model);
            model.select();
        });
        _this.readSelection();
    },
    readSelection: function(){
        this.setSelected(this.listCollection.find(function(model){return model.is('selected');}));
    },
    setSelected: function(model){
        if(!this._selected || this._selected.id !== model.id){
            this._selected = model;
            this.trigger('selectionChange');
        }
    },
    getSelected: function(){
        return this._selected;
    },
    getSelectedId: function(){
        if(this._selected){
            return this._selected.id;
        }
    },
    getSelectedName: function(){
        if(this._selected){
            return this._selected.get('name');
        }else{
            return Marionette.stringLookup('nothing.selected');
        }

    },
    getListLength: function(){
        return this.listCollection.length;
    },
    getCollection: function(){
        return this.get('items');
    }
});

var MultiSelectModel = Marionette.Model.extend({
    constructor: function(){
        this._selected=[];
        this._selectedIndex = {};
        Marionette.Model.apply(this, arguments);
        this.listCollection = this.getOption('items') ||  new MultiSelectCollection();
        this.setupSelection();
    },
    setupSelection: function(){
        var _this = this;
        var coll = _this.listCollection;
        _this.listenTo(coll, 'selectItem', function(model){
            _this._selectedIndex[model.id]=model;
            model.select();
            _this.trigger('selectionChange');
        });

        _this.listenTo(coll, 'deSelectItem', function(model){
            delete _this._selectedIndex[model.id];
            model.deselect();
            _this.trigger('selectionChange');
        });

        _this.listenTo(coll, 'toggleSelectItem', function(model){
            if(_this._selectedIndex[model.id]){
                coll.trigger('deSelectItem', model);
            }else{
                coll.trigger('selectItem', model);
            }
        });
        _this.readSelection();
    },
    readSelection: function(){
        this._selectedIndex = {};
        var coll = this.listCollection;
        coll.each(function(model){
            if(model.is('selected')){
                coll.trigger('selectItem', model);
            }
        });
        this.trigger('selectionChange');
    },
    getSelected:function(){
        return _.values(this._selectedIndex);
    },
    getSelectedIds:function(){
        return _.keys(this._selectedIndex);
    },
    getSelectedNames: function(){
        return _.map(this.getSelected(), function(model){
            return model.get('name');
        });
    },
    getCollection: function(){
        return this.get('items');
    },
    getListLength: function(){
        return this.listCollection.length;
    }
});

var SingleSelectSummaryView = Marionette.ItemView.extend({
    modelEvents:{
      selectionChange:'render'
    },
    getTemplate:function(){
        return Marionette.templateLookup('single.select.summary');
    },
    serializeData: function(){
        var model = this.model;
        var summary;
        if(model.getListLength() === 0){
            summary =  Marionette.stringLookup('no.options');
        }else if(!model.getSelected()){
            summary = Marionette.stringLookup('no.selection');
        }else{
            summary = model.getSelectedName();
        }
        return {
            summary:summary
        };
    }
});

var MultiSelectSummaryView = SingleSelectSummaryView.extend({
    getTemplate:function(){
        return Marionette.templateLookup('multi.select.summary');
    },
    serializeData:function(){
        var model = this.model;
        var summary, selectedCount = 0, selected = model.getSelected();
        if(model.getListLength() === 0){
            summary =  Marionette.stringLookup('no.options');
        }else if(selected.length === 0){
            summary = Marionette.stringLookup('no.selection');
        }else{
            selectedCount = selected.length;
            if(selected.length < 3){
                summary = model.getSelectedNames();
            }else{
                summary = Marionette.stringLookup('selected');
            }
        }
        return {
            summary:summary,
            selectedCount:selectedCount
        };
    }
});

var SingleSelectView = Marionette.LayoutView.extend({
    template: _.template('<div class="js-list-container"> </div><div class="js-summary-container single-select-list"> </div>'),
    regions:{
        listContainer:'.js-list-container',
        summaryContainer:'.js-summary-container'
    },
    onShow: function(){
        var CollectionView = this.getOption('CollectionView') || Marionette.CollectionView;
        var collection = this.model.listCollection;
        this.listContainer.show(new CollectionView({
            collection:collection,
            childView:SingleSelectItemView
        }));
        var showSummary = this.getOption('showSummary') || false;
        if(showSummary){
            this.summaryContainer.show(new SingleSelectSummaryView({
                model:this.model
            }));
        }

    }
});

var MultiSelectView = SingleSelectView.extend({
    template: _.template('<div class="js-list-container"> </div><div class="js-summary-container multi-select-list"> </div>'),
    onShow: function(){
        var CollectionView = this.getOption('CollectionView') || Marionette.CollectionView;
        var collection = this.model.listCollection;
        this.listContainer.show(new CollectionView({
            collection:collection,
            childView:MultiSelectItemView
        }));

        var showSummary = this.getOption('showSummary') || false;
        if(showSummary){
            this.summaryContainer.show(new MultiSelectSummaryView({
                model:this.model
            }));
        }
    }
});




Marionette.Selectable = {
    ItemModel:ItemModel,
    ItemView:ItemView,
    SingleSelectItemView:SingleSelectItemView,
    SingleSelectCollection:SingleSelectCollection,
    SingleSelectView:SingleSelectView,
    SingleSelectSummaryView:SingleSelectSummaryView,
    SingleSelectModel:SingleSelectModel,
    MultiSelectItemView:MultiSelectItemView,
    MultiSelectCollection:MultiSelectCollection,
    MultiSelectView:MultiSelectView,
    MultiSelectModel:MultiSelectModel,
    MultiSelectSummaryView:MultiSelectSummaryView
};
