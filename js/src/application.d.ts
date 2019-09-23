import { APIPipeline, APIRequest, APIResponder } from "./pipeline";
import { EventBroadcaster } from "./events";
import { APIHandlerFunc, IAPIHandler, IAPIRequest, IAPIResponder, IHostingEnvironment } from "./api-interfaces";
export declare type InitialRequestParser = (req: any) => APIRequest;
export declare enum RequestParsingResult {
    Done = "done",
    Continue = "continue",
    Abort = "abort"
}
export declare type RequestParserFunc = (req: any, parsedRequest: APIRequest) => RequestParsingResult;
export declare type ResponseProcessor = (target: any, response: APIResponder) => Promise<void>;
export declare type RequestCallback<TRequest, TResponse> = (req: TRequest, res: TResponse) => void;
export declare class RequestParseErrorEvent {
    req: any;
    parsedRequest: APIRequest;
    failure: Error;
    constructor(req: any, parsedRequest: APIRequest, failure: Error);
}
export declare class RequestAPIErrorEvent {
    request: IAPIRequest;
    response: IAPIResponder;
    failure: any;
    constructor(request: APIRequest, response: APIResponder, failure: any);
}
export declare class APIApplication {
    private _parsers;
    requestParseFailed: EventBroadcaster<RequestParseErrorEvent>;
    reuestError: EventBroadcaster<RequestAPIErrorEvent>;
    protected _pipeline: APIPipeline;
    use(handler: APIHandlerFunc): APIApplication;
    useHandler(handler: IAPIHandler): APIApplication;
    addRequestParser(parser: RequestParserFunc): APIApplication;
    generateCallbackForEnvironment<TRequest, TResponse>(environment: IHostingEnvironment<TRequest, TResponse>): RequestCallback<TRequest, TResponse>;
}
//# sourceMappingURL=application.d.ts.map