"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventBroadcaster {
    constructor() {
        this._listeners = [];
        this._onceListeners = [];
    }
    on(callback, once) {
        let targetCollection = once ? this._onceListeners : this._listeners;
        if (targetCollection.includes(callback)) {
            return false;
        }
        targetCollection.push(callback);
        return true;
    }
    _emitForCollection(collection, event) {
        for (let x = 0; x < collection.length; x++) {
            collection[x](event);
        }
    }
    emit(event) {
        this._emitForCollection(this._onceListeners, event);
        this._onceListeners = [];
        this._emitForCollection(this._listeners, event);
    }
}
exports.EventBroadcaster = EventBroadcaster;
//# sourceMappingURL=events.js.map