"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
let codeRoot = null;
function setCodeRoot(path) {
    codeRoot = path;
}
exports.setCodeRoot = setCodeRoot;
function resolveModule(path) {
    if (path.startsWith('~/')) {
        path = path_1.join(codeRoot, path.substring(2));
    }
    return require(path);
}
exports.resolveModule = resolveModule;
//# sourceMappingURL=modules-resolver.js.map