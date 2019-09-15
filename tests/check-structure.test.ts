import {definePIStructure} from '../src';
import {expect} from 'chai';
import {APIModuleCreationMethod, APIValueType} from "../src/api-interfaces";
import {APIModuleEntry} from "../src/api-structure";

describe('Tests for API structure generation from parsed JSON', function () {
    it('Create empty structure without nodes', () => {
        let structure = definePIStructure({
            name: 'Test API',
            version:'1.0.0',
            pathRoot: '/api/',
            defaultResponseType: null,
            errorTypes: null,
            modules:null
        });
        expect(structure).haveOwnPropertyDescriptor('name', 'API structure must have a name');
        expect(structure).haveOwnPropertyDescriptor('version', 'API structure must have a version');
    });

    it('Create empty structure without nodes', () => {
        let structure = definePIStructure({
            name: 'Test API',
            version:'1.0.0',
            pathRoot: '/api/',
            defaultResponseType: null,
            errorTypes: null,
            modules:{
                "pagesModule": { path: 'modules/pages', creationMethod: APIModuleCreationMethod.ConstructorCall }
            }
        });
        expect(structure).haveOwnPropertyDescriptor('name', 'API structure must have a name');
        expect(structure).haveOwnPropertyDescriptor('version', 'API structure must have a version');
        expect(structure.modules['pagesModule']).instanceOf(APIModuleEntry);
    });

    it('define API with group', () => {
        let structure = definePIStructure({
            name: 'API Test',
            version: '1.0.0',
            pathRoot: '/',
            modules: {},
            errorTypes:{},
            defaultResponseType: {
                valueType: APIValueType.Object,
                properties: {
                    "message": { valueType: { valueType: APIValueType.String }, required: true, defaultValue: 'Operation completed successfully', isMapName: false }
                }
            }
        });
        expect(structure.defaultResponseType.valueType).equal(APIValueType.Object);
    })

});

