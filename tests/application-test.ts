import {TestingEnvironment} from "./testing-environment";
import {APIApplication} from "../src";
import { expect } from 'chai';
describe('Test basic functions of application class', () => {
    it('application instance creation and Env attachment', (done) => {
        let env = new TestingEnvironment('testing');
        let app = new APIApplication();
        let appCallback = app.generateCallbackForEnvironment(env);
        expect(appCallback).a('function');
        done();
    });
});