import {expect} from 'chai';
import {APICompiledRoute, APIRouter, makeUrlTemplate} from "../src/routing";
import {APIRequest, defineAPIStructure, HttpVerb} from "../src";
import {APIResponder} from "../src/pipeline";
import {APIResultAction} from "../src/api-interfaces";

describe('Test routing infrastructure', () => {
    it('Test url templates', () => {
        let urlTemplate = makeUrlTemplate('auth', 'sign-in');
        expect(urlTemplate.urlTemplate).equals('auth/sign-in');
        let match = urlTemplate.validateUrl('auth/sign-in');
        expect(match).deep.equal({});
    });
    it('basic routing test', () => {
        let compiledRoute = new APICompiledRoute(HttpVerb.GET, "/api/:controller/:action?", null, null);
        let apiRequest = new APIRequest(HttpVerb.GET, '/test/someUrl', null, null, null, null, null,null,'test1');
        let check1Result = compiledRoute.checkForRequestMatch(apiRequest.method, apiRequest.path);
        expect(check1Result).equal(null);
        apiRequest = new APIRequest(HttpVerb.GET, '/api/auth/status', null, null, null, null, null,null,'test2');
        let positiveCheck = compiledRoute.checkForRequestMatch(apiRequest.method, apiRequest.path);
        expect(positiveCheck).deep.equal({
            controller: 'auth',
            action: 'status'
        });
    });

    function fillAPIRouterWithTestStructure(router: APIRouter) {
        let structure = defineAPIStructure({
            version: '1.0.0',
            name: 'test api',
            groups: [
                {
                    name: 'Authentication',
                    controller: 'auth',
                    routePrefix: 'auth',
                    routes: [
                        {
                            name: 'Sign In',
                            routeTemplate: 'sign-in',
                            action: 'signIn',
                            verb: 'POST'
                        },
                        {
                            name: 'Sign Out',
                            routeTemplate: 'sign-out',
                            action: 'signOut',
                            verb: 'POST'
                        }
                    ]
                }
            ]
        });
        for(const group of structure.groups) {
            for(const route of group.routes) {
                router.forRoute(route, (req, res) => {
                    return res.json({
                        message: `processed ${req.method} to ${req.url} ${req.matchedRoute.controller}.${req.matchedRoute.action}`,
                        route: req.matchedRoute.name,
                        controller: req.matchedRoute.controller,
                        action: req.matchedRoute.action,

                    })
                })
            }
        }
    }

    it('Test API router routes picking', () => {
        let router = new APIRouter();
        fillAPIRouterWithTestStructure(router);
        let routePickResult = router.tryPickRoute(HttpVerb.POST, '/auth/sign-in');
        expect(routePickResult).is.not.equals(null);
        expect(routePickResult.route.name).equals('Authentication/Sign In');
        expect(routePickResult.route.controller).equals('auth');
        expect(routePickResult.route.action).equals('signIn');
    });

    it('Test API router request flow', (done) => {
        let router = new APIRouter();
        fillAPIRouterWithTestStructure(router);
        let routePickResult = router.tryPickRoute(HttpVerb.POST, '/auth/sign-in');
        expect(routePickResult).is.not.equals(null);
        let responder = new APIResponder();
        let request = new APIRequest(HttpVerb.POST, '/auth/sign-in', null, null, routePickResult.route, {}, null, {}, 'test1');
        router.processRequest(request, responder).then(() => {
            expect(responder.action).equal(APIResultAction.SendJSON);
            expect(responder.body).deep.equal({
                message: `processed ${request.method} to ${request.url} ${request.matchedRoute.controller}.${request.matchedRoute.action}`,
                route: request.matchedRoute.name,
                controller: request.matchedRoute.controller,
                action: request.matchedRoute.action,
            });
            done();
        });
    });

});