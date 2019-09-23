export interface IListener<T> {
(event: T):void
}

export class EventBroadcaster<T>{
    private _listeners : IListener<T>[] = [];
    private _onceListeners : IListener<T>[] = [];
    on(callback: IListener<T>, once?: boolean): boolean {
        let targetCollection = once ? this._onceListeners : this._listeners;
        if (targetCollection.includes(callback)) {
            return false;
        }
        targetCollection.push(callback);
        return true;
    }
    _emitForCollection(collection:IListener<T>[], event: T) : void {
        for(let x = 0; x < collection.length; x++) {
            collection[x](event);
        }
    }
    emit(event: T) : void {
        this._emitForCollection(this._onceListeners, event);
        this._onceListeners = [];
        this._emitForCollection(this._listeners, event);
    }
}