"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_structure_1 = require("./api-structure");
var definition_interfaces_1 = require("./definition-interfaces");
exports.HttpVerb = definition_interfaces_1.HttpVerb;
var api_structure_2 = require("./api-structure");
exports.APIStructure = api_structure_2.APIStructure;
exports.defineAPIStructure = api_structure_2.defineAPIStructure;
var modules_resolver_1 = require("./modules-resolver");
exports.setCodeRoot = modules_resolver_1.setCodeRoot;
var request_validator_1 = require("./request-validator");
exports.compileValidator = request_validator_1.compileValidator;
exports.ValidationErrorCodes = request_validator_1.ValidationErrorCodes;
exports.loadAPIStructureFromJSON = (objectJSON) => {
    if (typeof (objectJSON) === 'string') {
        objectJSON = JSON.parse(objectJSON);
    }
    return api_structure_1.defineAPIStructure(objectJSON);
};
//# sourceMappingURL=index.js.map