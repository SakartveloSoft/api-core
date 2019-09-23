export interface IListener<T> {
    (event: T): void;
}
export declare class EventBroadcaster<T> {
    private _listeners;
    private _onceListeners;
    on(callback: IListener<T>, once?: boolean): boolean;
    _emitForCollection(collection: IListener<T>[], event: T): void;
    emit(event: T): void;
}
//# sourceMappingURL=events.d.ts.map