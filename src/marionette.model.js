/* jshint maxlen: 134, nonew: false */
// Marionette.Model
// ---------------

// The core view class that other Marionette models extend from.
Marionette.Model = Backbone.Model.extend({
    constructor: function (options) {
        this.options = _.extend({}, _.result(this, 'options'), _.isFunction(options) ? options.call(this) : options);
        Backbone.Model.apply(this, arguments);
    },
    is: function (attribute) {
        return this.get(attribute) === true;
    },
    isNot: function (attribute) {
        return this.get(attribute) === false;
    },
    isEqual: function (attribute, value) {
        return this.get(attribute) === value;
    },
    isNotEqual: function (attribute, value) {
        return this.get(attribute) !== value;
    },
    removeSelf: function () {
        if (this.collection) {
            this.collection.remove(this);
        }
    },
    isDefault: function (attribute, value) {
        return this.defaults[attribute] === value;
    },
    setDefault: function (attribute, value) {
        this.defaults[attribute] = value;
    },
    isTemp: function () {
        return this.id.indexOf && this.id.indexOf('__tmp_') === 0;
    },
    /* jshint ignore:start */
    reset: function (key, val, options) {
        var attr, attrs, unset, changes, silent, changing, prev, current, missing;
        if (key == null) return this;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        options || (options = {});

        // Run validation.
        if (!this._validate(attrs, options)) return false;

        // Extract attributes and options.
        unset = options.unset;
        silent = options.silent;
        changes = [];

        changing = this._changing;
        this._changing = true;

        if (!changing) {
            this._previousAttributes = _.clone(this.attributes);
            this.changed = {};
        }
        current = this.attributes, prev = this._previousAttributes;

        missing = _.omit(this._previousAttributes, _.keys(attrs));

        // Check for changes of `id`.
        if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];


        for (attr in missing) {
            val = attrs[attr];
            if (!_.isEqual(current[attr], val)) changes.push(attr);
            if (!_.isEqual(prev[attr], val)) {
                this.changed[attr] = val;
            } else {
                delete this.changed[attr];
            }
            delete current[attr]
        }


        // For each `set` attribute, update or delete the current value.
        for (attr in attrs) {
            val = attrs[attr];
            if (!_.isEqual(current[attr], val)) changes.push(attr);
            if (!_.isEqual(prev[attr], val)) {
                this.changed[attr] = val;
            } else {
                delete this.changed[attr];
            }
            unset ? delete current[attr] : current[attr] = val;
        }

        // Trigger all relevant attribute changes.
        if (!silent) {
            if (changes.length) this._pending = true;
            for (var i = 0, l = changes.length; i < l; i++) {
                this.trigger('change:' + changes[i], this, current[changes[i]], options);
            }
        }

        // You might be wondering why there's a `while` loop here. Changes can
        // be recursively nested within `"change"` events.
        if (changing) return this;
        if (!silent) {
            while (this._pending) {
                this._pending = false;
                this.trigger('change', this, options);
            }
        }
        this._pending = false;
        this._changing = false;
        return this;

    },
    /* jshint ignore:end */
    triggerMethod: Marionette.triggerMethod,
    normalizeMethods: Marionette.normalizeMethods,
    getOption: Marionette.proxyGetOption
});
