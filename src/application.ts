import {APIPipeline, APIRequest, APIResponder} from "./pipeline";
import {EventBroadcaster} from "./events";
import {
    APIHandlerFunc,
    IAPIHandler,
    IAPIPipeline,
    IAPIRequest,
    IAPIResponder, IAPIResult, IAPIRouter,
    IHostingEnvironment
} from "./api-interfaces";
export type RequestCallback = (req:APIRequest) => Promise<void>;

export class RequestAPICompletedEvent {
    public request: IAPIRequest;
    public response: IAPIResponder;
    public details: any;
    constructor(request: APIRequest, response: APIResponder, details: any) {
        this.request = request;
        this.response = response;
        this.details = details;
    }
}

export class RequestAPIErrorEvent {
    public request: IAPIRequest;
    public response: IAPIResponder;
    public failure: any;
    constructor(request: APIRequest, response: APIResponder, failure: any) {
        this.request = request;
        this.response = response;
        this.failure = failure;
    }
}
export class APIApplication implements IAPIPipeline{
    public requestCompleted = new EventBroadcaster<RequestAPICompletedEvent>();
    public requestError = new EventBroadcaster<RequestAPIErrorEvent>();
    protected _pipeline = new APIPipeline();
    public use(handler: APIHandlerFunc): APIApplication {
        this._pipeline.appendHandler(handler);
        return this;
    }
    public useHandler(handler: IAPIHandler): APIApplication {
        this._pipeline.appendHandler(handler.callback());
        return this;
    }
    public useRouter(router: IAPIRouter): APIApplication {
        this._pipeline.appendHandler(router.callback());
        return this;
    }
    public generateCallbackForEnvironment(environment: IHostingEnvironment) : RequestCallback  {
        return (apiRequest:APIRequest) : Promise<void> => {
            let responder = new APIResponder();
            return this._pipeline.callback()(apiRequest, responder).then(() => {
                return environment.processResponse(apiRequest, responder).then((ret) => {
                    this.requestCompleted.emit(new RequestAPICompletedEvent(apiRequest, responder, ret));
                });
            }).catch(err => {
                this.requestError.emit(new RequestAPIErrorEvent(apiRequest, responder, err));
                return environment.processError(apiRequest, responder, err);
            });
        }
    }

    appendHandler(handler: (request: IAPIRequest, responder: IAPIResponder) => Promise<IAPIResult>): IAPIPipeline {
        this._pipeline.appendHandler(handler);
        return this;
    }

    appendPipeline(other: IAPIPipeline): IAPIPipeline {
        this._pipeline.appendPipeline(other);
        return this;
    }

    callback(): (request: IAPIRequest, responder: IAPIResponder) => Promise<IAPIResult> {
        return this._pipeline.callback();
    }

    prependHandler(handler: (request: IAPIRequest, responder: IAPIResponder) => Promise<IAPIResult>): IAPIPipeline {
        this._pipeline.prependHandler(handler);
        return this;
    }

    prependPipeline(other: IAPIPipeline): IAPIPipeline {
        this._pipeline.prependPipeline(other);
        return this;
    }
}