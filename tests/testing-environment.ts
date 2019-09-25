import {IHostingEnvironment} from "../src";
import {APIRequest, APIResponder} from "../src/pipeline";
import {IAPIError} from "../src/api-interfaces";

export class TestingEnvironment implements IHostingEnvironment {
    readonly environmentId: string;
    private doneCallback: (req: APIRequest, res: APIResponder, err?: any) => void;

    constructor(envId?: string, doneCallback?: (req: APIRequest, res: APIResponder, err?: any) => void) {
        this.environmentId = envId || 'staging';
        this.doneCallback = doneCallback || ((req, res, err) => {});
    }

    processError(request: APIRequest, responder: APIResponder, error: IAPIError): Promise<void> {
        return Promise.resolve(this.doneCallback(request, responder, error));
    }

    processResponse(request: APIRequest, responder: APIResponder): Promise<void> {
        return Promise.resolve(this.doneCallback(request, responder, null));
    }

}