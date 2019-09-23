import {expect} from 'chai';
import {APICompiledRoute} from "../src/routing";
import {HttpVerb} from "../src/definition-interfaces";
import {APIRequest} from "../src/pipeline";

describe('Test routing infrastructure', () => {
    it('basic routing test', () => {
        let compiledRoute = new APICompiledRoute(HttpVerb.GET, "/api/:controller/:action?", null, null);
        let apiRequest = new APIRequest(HttpVerb.GET, '/test/someUrl', null, null, null, null, 'test1');
        let check1Result = compiledRoute.checkForRequestMatch(apiRequest);
        expect(check1Result).equal(null);
        apiRequest = new APIRequest(HttpVerb.GET, '/api/auth/status', null, null, null, null, 'test2');
        let positiveCheck = compiledRoute.checkForRequestMatch(apiRequest);
        expect(positiveCheck).deep.equal({
            controller: 'auth',
            action: 'status'
        });
    });
});