import {defineValidator} from '../src';
import {APIValueSourceType, APIValueType} from "../src/api-interfaces";
import {expect} from 'chai';

describe('Test validator compilation',() => {
    it('Compile testing validators', () => {
        let validator = defineValidator({
            valueType: APIValueType.String,
        }, {
           required: true,
           minLength: 3
        });

        let result = validator('1234 ', APIValueSourceType.Body);
        expect(result.isSuccess).equal(true);
        expect(result.value).equal('1234');
        let negativeResultRequiredCheck = validator(null, APIValueSourceType.Body);
        expect(negativeResultRequiredCheck.isSuccess).equal(false);
        expect(negativeResultRequiredCheck.errorCode).equal('required');

    });
});