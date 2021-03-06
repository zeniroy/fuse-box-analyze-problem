"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../../Utils");
class QuantumOptions {
    constructor(opts) {
        this.removeExportsInterop = false;
        this.removeUseStrict = true;
        this.ensureES5 = true;
        this.replaceProcessEnv = true;
        this.containedAPI = false;
        this.processPolyfill = false;
        this.replaceTypeOf = true;
        this.showWarnings = true;
        this.hoisting = false;
        this.extendServerImport = false;
        this.optsTarget = "browser";
        this.treeshake = false;
        opts = opts || {};
        if (opts.target) {
            this.optsTarget = opts.target;
        }
        if (opts.api) {
            this.apiCallback = opts.api;
        }
        if (opts.manifest !== undefined) {
            if (typeof opts.manifest === "string") {
                this.manifestFile = opts.manifest;
            }
            if (opts.manifest === true) {
                this.manifestFile = "manifest.json";
            }
        }
        if (opts.uglify) {
            this.uglify = opts.uglify;
        }
        if (opts.processPolyfill !== undefined) {
            this.processPolyfill = opts.processPolyfill;
        }
        if (opts.warnings !== undefined) {
            this.showWarnings = opts.warnings;
        }
        if (opts.replaceTypeOf !== undefined) {
            this.replaceTypeOf = opts.replaceTypeOf;
        }
        if (opts.containedAPI !== undefined) {
            this.containedAPI = opts.containedAPI;
        }
        if (Array.isArray(opts.polyfills)) {
            this.polyfills = opts.polyfills;
        }
        if (opts.removeExportsInterop !== undefined) {
            this.removeExportsInterop = opts.removeExportsInterop;
        }
        if (opts.replaceProcessEnv !== undefined) {
            this.replaceProcessEnv = this.replaceProcessEnv;
        }
        if (opts.removeUseStrict !== undefined) {
            this.removeUseStrict = opts.removeUseStrict;
        }
        if (opts.webIndexPlugin) {
            this.webIndexPlugin = opts.webIndexPlugin;
        }
        if (opts.hoisting !== undefined) {
            if (typeof opts.hoisting === "boolean") {
                this.hoisting = opts.hoisting;
            }
            else {
                this.hoisting = true;
                const hoistingOptions = opts.hoisting;
                this.hoistedNames = hoistingOptions.names;
            }
        }
        if (opts.bakeApiIntoBundle) {
            this.bakeApiIntoBundle = opts.bakeApiIntoBundle;
        }
        if (opts.extendServerImport !== undefined) {
            this.extendServerImport = opts.extendServerImport;
        }
        if (opts.ensureES5 !== undefined) {
            this.ensureES5 = opts.ensureES5;
        }
        if (opts.treeshake !== undefined) {
            if (typeof opts.treeshake === "boolean") {
                this.treeshake = opts.treeshake;
            }
            else {
                this.treeshake = true;
                this.treeshakeOptions = opts.treeshake;
            }
        }
    }
    shouldBundleProcessPolyfill() {
        return this.processPolyfill === true;
    }
    enableContainedAPI() {
        return this.containedAPI = true;
    }
    shouldReplaceTypeOf() {
        return this.replaceTypeOf;
    }
    getPromisePolyfill() {
        if (this.polyfills && this.polyfills.indexOf("Promise") > -1) {
            return Utils_1.readFuseBoxModule("fuse-box-responsive-api/promise-polyfill.js");
        }
    }
    getManifestFilePath() {
        return this.manifestFile;
    }
    canBeRemovedByTreeShaking(file) {
        if (this.treeshakeOptions) {
            if (this.treeshakeOptions.shouldRemove) {
                return this.treeshakeOptions.shouldRemove(file);
            }
        }
        return true;
    }
    isContained() {
        return this.containedAPI;
    }
    throwContainedAPIError() {
        throw new Error(`
           - Can't use contained api with more than 1 bundle
           - Use only 1 bundle and bake the API e.g {bakeApiIntoBundle : "app"}
           - Make sure code splitting is not in use 
        `);
    }
    shouldRemoveUseStrict() {
        return this.removeUseStrict;
    }
    shouldEnsureES5() {
        return this.ensureES5;
    }
    shouldDoHoisting() {
        return this.hoisting;
    }
    getHoistedNames() {
        return this.hoistedNames;
    }
    isHoistingAllowed(name) {
        if (this.hoistedNames) {
            return this.hoistedNames.indexOf(name) > -1;
        }
        return true;
    }
    shouldExtendServerImport() {
        return this.extendServerImport;
    }
    shouldShowWarnings() {
        return this.showWarnings;
    }
    shouldUglify() {
        return this.uglify;
    }
    shouldBakeApiIntoBundle() {
        return this.bakeApiIntoBundle;
    }
    shouldTreeShake() {
        return this.treeshake;
    }
    shouldRemoveExportsInterop() {
        return this.removeExportsInterop;
    }
    shouldReplaceProcessEnv() {
        return this.replaceProcessEnv;
    }
    getTarget() {
        return this.optsTarget;
    }
    isTargetElectron() {
        return this.optsTarget === "electron";
    }
    isTargetUniveral() {
        return this.optsTarget === "universal" || this.optsTarget === "npm";
    }
    isTargetNpm() {
        return this.optsTarget === "npm";
    }
    isTargetServer() {
        return this.optsTarget === "server" || this.optsTarget === "electron";
    }
    isTargetBrowser() {
        return this.optsTarget === "browser";
    }
}
exports.QuantumOptions = QuantumOptions;

//# sourceMappingURL=QuantumOptions.js.map
