"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const api_interfaces_1 = require("../src/api-interfaces");
const chai_1 = require("chai");
describe('Test validator compilation', () => {
    it('Compile testing compilation', () => {
        let validator = src_1.defineValidator({
            valueType: api_interfaces_1.APIValueType.String,
        }, {
            required: true,
            minLength: 8
        });
        let result = validator('1234 ', api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(result.errorCode).equal('valueCleanedUp');
        chai_1.expect(result.value).equal('1234');
    });
});
//# sourceMappingURL=validators-compilation.test.js.map