import Ember from 'ember';
import {Socket} from 'vendor/ember-phoenix-chan/phoenix';
var PhoenixService, Promise, RSVP, computed, equal, isBlank;

computed = Ember.computed, isBlank = Ember.isBlank, RSVP = Ember.RSVP;

equal = computed.equal;

Promise = RSVP.Promise;

PhoenixService = Ember.Service.extend({
  isConnected: equal("connectionState", "open"),
  p: computed({
    get: RSVP.resolve(this)
  }),
  init: function() {
    this._super.apply(this, arguments);
    return this.updateStatus();
  },
  updateStatus: function() {
    var ref, ref1, state;
    state = (ref = (ref1 = this.get("socket")) != null ? ref1.connectionState() : void 0) != null ? ref : "closed";
    return this.set("connectionState", state);
  },
  disconnect: function() {
    if (isBlank(this.get("socket"))) {
      return this.get("p");
    }
    return new Promise((function(_this) {
      return function(resolve) {
        return _this.get("socket").disconnect(function() {
          _this.set("socket", null);
          return resolve(_this);
        });
      };
    })(this));
  },
  connect: function(endpoint, params) {
    if (params == null) {
      params = {};
    }
    return this.disconnect().then((function(_this) {
      return function() {
        var socket, update;
        socket = new Socket(endpoint, params);
        _this.set("socket", socket);
        update = _this.updateStatus.bind(_this);
        socket.onMessage(update);
        socket.onClose(update);
        socket.onError(update);
        socket.onOpen(update);
        socket.connect();
        return new Promise(function(resolve, reject) {
          socket.onOpen(function() {
            return resolve(_this);
          });
          return socket.onError(function() {
            return reject(_this);
          });
        });
      };
    })(this));
  }
});

export default PhoenixService;
