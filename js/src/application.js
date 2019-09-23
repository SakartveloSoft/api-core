"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pipeline_1 = require("./pipeline");
const events_1 = require("./events");
var RequestParsingResult;
(function (RequestParsingResult) {
    RequestParsingResult["Done"] = "done";
    RequestParsingResult["Continue"] = "continue";
    RequestParsingResult["Abort"] = "abort";
})(RequestParsingResult = exports.RequestParsingResult || (exports.RequestParsingResult = {}));
class RequestParseErrorEvent {
    constructor(req, parsedRequest, failure) {
        this.req = req;
        this.parsedRequest = parsedRequest;
        this.failure = failure;
    }
}
exports.RequestParseErrorEvent = RequestParseErrorEvent;
class RequestAPIErrorEvent {
    constructor(request, response, failure) {
        this.request = request;
        this.response = response;
        this.failure = failure;
    }
}
exports.RequestAPIErrorEvent = RequestAPIErrorEvent;
class APIApplication {
    constructor() {
        this._parsers = [];
        this.requestParseFailed = new events_1.EventBroadcaster();
        this.reuestError = new events_1.EventBroadcaster();
        this._pipeline = new pipeline_1.APIPipeline();
    }
    use(handler) {
        this._pipeline.appendHandler(handler);
        return this;
    }
    useHandler(handler) {
        this._pipeline.appendHandler(handler.callback());
        return this;
    }
    addRequestParser(parser) {
        this._parsers.push(parser);
        return this;
    }
    generateCallbackForEnvironment(environment) {
        return (req, res) => {
            let apiRequest = environment.analyzeRequest(req);
            for (let x = 0; x < this._parsers.length; x++) {
                let result = this._parsers[x](req, apiRequest);
                switch (result) {
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
            let responder = new pipeline_1.APIResponder();
            this._pipeline.callback()(apiRequest, responder).then(() => {
                return environment.responseProcessor(res, responder);
            }).catch(err => {
                this.reuestError.emit(new RequestAPIErrorEvent(apiRequest, responder, err));
            });
        };
    }
}
exports.APIApplication = APIApplication;
//# sourceMappingURL=application.js.map