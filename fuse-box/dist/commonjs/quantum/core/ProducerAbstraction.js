"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const ProducerWarning_1 = require("./ProducerWarning");
class ProducerAbstraction {
    constructor(opts) {
        this.warnings = new Set();
        this.bundleAbstractions = new Map();
        this.useNumbers = true;
        this.useComputedRequireStatements = false;
        this.opts = opts || {};
        this.quantumCore = this.opts.quantumCore;
        this.opts.customComputedStatementPaths = this.opts.customComputedStatementPaths || new Set();
    }
    registerBundleAbstraction(bundleAbstraction) {
        bundleAbstraction.producerAbstraction = this;
        this.bundleAbstractions.set(bundleAbstraction.name, bundleAbstraction);
    }
    addWarning(msg) {
        this.warnings.add(new ProducerWarning_1.ProducerWarning(msg));
    }
    findFileAbstraction(packageName, resolvedPathRaw) {
        let combinations = utils_1.generateFileCombinations(resolvedPathRaw);
        let requiredFileAbstraction;
        this.bundleAbstractions.forEach(bundle => {
            if (requiredFileAbstraction) {
                return;
            }
            ;
            const pkg = bundle.packageAbstractions.get(packageName);
            if (pkg) {
                const entryFile = pkg.entryFile;
                if (!combinations) {
                    combinations = utils_1.generateFileCombinations(entryFile);
                }
                combinations.some(combination => {
                    let found;
                    pkg.fileAbstractions.forEach(file => {
                        if (requiredFileAbstraction) {
                            return;
                        }
                        ;
                        found = file.fuseBoxPath === combination;
                        if (found) {
                            requiredFileAbstraction = file;
                        }
                    });
                    return found;
                });
            }
        });
        return requiredFileAbstraction;
    }
}
exports.ProducerAbstraction = ProducerAbstraction;

//# sourceMappingURL=ProducerAbstraction.js.map
