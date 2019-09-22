"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_structure_1 = require("./api-structure");
const modules_resolver_1 = require("./modules-resolver");
const request_validator_1 = require("./request-validator");
exports.definePIStructure = (structureDefinition) => api_structure_1.defineAPIStructure(structureDefinition);
exports.loadAPIStructureFromJSON = (objectJSON) => {
    if (typeof (objectJSON) === 'string') {
        objectJSON = JSON.parse(objectJSON);
    }
    return exports.definePIStructure(objectJSON);
};
exports.bindsCodeRoot = modules_resolver_1.setCodeRoot;
exports.defineValidator = request_validator_1.compileValidator;
exports.ValidationErrors = request_validator_1.ValidationErrorCodes;
//# sourceMappingURL=index.js.map