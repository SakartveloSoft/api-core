import {expect} from 'chai';
import {APICompiledRoute, APIRouter, makeUrlTemplate} from "../src/routing";
import {APIRequest, defineAPIStructure, HttpVerb} from "../src";

describe('Test routing infrastructure', () => {
    it('Test url templates', () => {
        let urlTemplate = makeUrlTemplate('auth', 'sign-in');
        expect(urlTemplate.urlTemplate).equals('auth/sign-in');
        let match = urlTemplate.validateUrl('auth/sign-in');
        expect(match).deep.equal({});
    });
    it('basic routing test', () => {
        let compiledRoute = new APICompiledRoute(HttpVerb.GET, "/api/:controller/:action?", null, null);
        let apiRequest = new APIRequest(HttpVerb.GET, '/test/someUrl', null, null, null, null, 'test1');
        let check1Result = compiledRoute.checkForRequestMatch(apiRequest.method, apiRequest.url);
        expect(check1Result).equal(null);
        apiRequest = new APIRequest(HttpVerb.GET, '/api/auth/status', null, null, null, null, 'test2');
        let positiveCheck = compiledRoute.checkForRequestMatch(apiRequest.method, apiRequest.url);
        expect(positiveCheck).deep.equal({
            controller: 'auth',
            action: 'status'
        });
    });

    it('Test API router with multiple routes', () => {
        let router = new APIRouter();
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
                        controller: req.matchedRoute.apiRoute.controller,

                    })
                })
            }
        }
        let routePickResult = router.tryPickRoute(HttpVerb.POST, '/auth/sign-in');
        expect(routePickResult).is.not.equals(null);
        expect(routePickResult.route.controller).equals('auth');
        expect(routePickResult.route.action).equals('signIn');
    })
});