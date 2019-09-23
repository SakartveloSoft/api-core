"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const routing_1 = require("../src/routing");
const definition_interfaces_1 = require("../src/definition-interfaces");
const pipeline_1 = require("../src/pipeline");
describe('Test routing infrastructure', () => {
    it('basic routing test', () => {
        let compiledRoute = new routing_1.APICompiledRoute(definition_interfaces_1.HttpVerb.GET, "/api/:controller/:action?", null, null);
        let apiRequest = new pipeline_1.APIRequest(definition_interfaces_1.HttpVerb.GET, '/test/someUrl', null, null, null, null, 'test1');
        let check1Result = compiledRoute.checkForRequestMatch(apiRequest);
        chai_1.expect(check1Result).equal(null);
        apiRequest = new pipeline_1.APIRequest(definition_interfaces_1.HttpVerb.GET, '/api/auth/status', null, null, null, null, 'test2');
        let positiveCheck = compiledRoute.checkForRequestMatch(apiRequest);
        chai_1.expect(positiveCheck).deep.equal({
            controller: 'auth',
            action: 'status'
        });
    });
});
//# sourceMappingURL=routing.test.js.map