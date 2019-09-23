import {APIPipeline, APIRequest, APIResponder} from "./pipeline";
import {EventBroadcaster} from "./events";
import {APIHandlerFunc, IAPIHandler, IAPIRequest, IAPIResponder} from "./api-interfaces";
export type InitialRequestParser = (req: any) => APIRequest;
export enum RequestParsingResult {
    Done= "done",
    Continue = "continue",
    Abort = "abort"
}
export type RequestParserFunc = (req:any, parsedRequest: APIRequest) => RequestParsingResult;
export type ResponseProcessor = (target: any, response: APIResponder) => Promise<void>;
export interface IHostingEnvironment<TRequest, TResponse> {
    analyzeRequest(request:TRequest): APIRequest;
    responseProcessor(target:TResponse, responder:APIResponder):Promise<void>;
}
export type RequestCallback<TRequest, TResponse> = (req:TRequest, res:TResponse) => void;
export class RequestParseErrorEvent {
    public req: any;
    public parsedRequest: APIRequest;
    public failure: Error;
    constructor(req: any, parsedRequest: APIRequest, failure: Error) {
        this.req = req;
        this.parsedRequest = parsedRequest;
        this.failure = failure;
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
export class APIApplication {
    private _parsers : RequestParserFunc[] = [];
    public requestParseFailed = new EventBroadcaster<RequestParseErrorEvent>();
    public reuestError = new EventBroadcaster<RequestAPIErrorEvent>()
    protected _pipeline = new APIPipeline();
    public use(handler: APIHandlerFunc): APIApplication {
        this._pipeline.appendHandler(handler);
        return this;
    }
    public useHandler(handler: IAPIHandler): APIApplication {
        this._pipeline.appendHandler(handler.callback());
        return this;
    }
    public addRequestParser(parser: RequestParserFunc):Application {
        this._parsers.push(parser);
        return this;
    }
    public generateCallbackForEnvironment<TRequest, TResponse>(environment: IHostingEnvironment<TRequest, TResponse>) : RequestCallback<TRequest, TResponse>  {
        return (req:TRequest,res: TResponse) : void => {
            let apiRequest = environment.analyzeRequest(req);
            for(let x = 0; x < this._parsers.length; x++) {
                let result = this._parsers[x](req, apiRequest);
                switch(result) {
                    case undefined:
                    case RequestParsingResult.Continue:
                        continue;
                    case RequestParsingResult.Abort:
                        this.requestParseFailed.emit(new RequestParseErrorEvent(req, apiRequest, null));
                        return;
                    case RequestParsingResult.Done:
                        break;

                }
            }
            let responder = new APIResponder();
            this._pipeline.callback()(apiRequest, responder).then(() => {
                return environment.responseProcessor(res, responder);
            }).catch(err => {
                this.reuestError.emit(new RequestAPIErrorEvent(apiRequest, responder, err));
            });
        }
    }
}