"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const chai_1 = require("chai");
const definition_interfaces_1 = require("../src/definition-interfaces");
const api_structure_1 = require("../src/api-structure");
describe('Tests for API structure generation from parsed JSON', function () {
    it('Create empty structure without nodes', () => {
        let structure = src_1.loadAPIStructureFromJSON({
            name: 'Test API',
            version: '1.0.0',
            pathRoot: '/api/',
            defaultResponseType: null,
            errorTypes: null,
            modules: null
        });
        chai_1.expect(structure).haveOwnPropertyDescriptor('name', 'API structure must have a name');
        chai_1.expect(structure).haveOwnPropertyDescriptor('version', 'API structure must have a version');
    });
    it('Create empty structure without nodes', () => {
        let structure = src_1.loadAPIStructureFromJSON({
            name: 'Test API',
            version: '1.0.0',
            pathRoot: '/api/',
            defaultResponseType: null,
            errorTypes: null,
            modules: {
                "pagesModule": { path: 'modules/pages', creationMethod: definition_interfaces_1.APIModuleCreationMethod.ConstructorCall }
            }
        });
        chai_1.expect(structure).haveOwnPropertyDescriptor('name', 'API structure must have a name');
        chai_1.expect(structure).haveOwnPropertyDescriptor('version', 'API structure must have a version');
        chai_1.expect(structure.modules['pagesModule']).instanceOf(api_structure_1.APIModuleEntry);
    });
    it('define API with group', () => {
        let structure = src_1.loadAPIStructureFromJSON({
            name: 'API Test',
            version: '1.0.0',
            pathRoot: '/',
            modules: {},
            errorTypes: {},
            defaultResponseType: {
                valueType: definition_interfaces_1.APIValueType.Object,
                properties: {
                    "message": { valueSchema: { valueType: definition_interfaces_1.APIValueType.String }, required: true, defaultValue: 'Operation completed successfully', isMapName: false }
                }
            }
        });
        chai_1.expect(structure.defaultResponseType.valueType).equal(definition_interfaces_1.APIValueType.Object);
    });
});
//# sourceMappingURL=check-structure.test.js.map