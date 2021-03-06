"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const realm_utils_1 = require("realm-utils");
class TreeShake {
    constructor(core) {
        this.core = core;
    }
    shake() {
        return this.eachFile(file => this.shakeExports(file))
            .then(() => this.releaseReferences())
            .then(() => this.removeUnusedExports());
    }
    releaseReferences() {
        return this.eachFile(file => {
            if (file.isNotUsedAnywhere() && this.core.opts.canBeRemovedByTreeShaking(file)) {
                return this.eachFile(target => target.releaseDependent(file));
            }
        });
    }
    removeUnusedExports() {
        return this.eachFile(file => {
            file.namedExports.forEach(fileExport => {
                if (!fileExport.isUsed && file.isTreeShakingAllowed()
                    && fileExport.eligibleForTreeShaking) {
                    const isDangerous = fileExport.name === "__esModule" || fileExport.name === "default";
                    if (!isDangerous) {
                        this.core.log.echoInfo(`tree shaking: Remove ${fileExport.name} from ${file.getFuseBoxFullPath()}`);
                        fileExport.remove();
                    }
                }
            });
            if (file.isNotUsedAnywhere() && this.core.opts.canBeRemovedByTreeShaking(file)) {
                this.core.log.echoInfo(`tree shaking: Mark for removal ${file.getFuseBoxFullPath()}`);
                file.markForRemoval();
            }
        });
    }
    shakeExports(target) {
        return this.eachFile(file => {
            const dependencies = file.getDependencies();
            if (dependencies.has(target)) {
                const dependency = dependencies.get(target);
                dependency.forEach(statement => {
                    if (statement.usedNames.size > 0) {
                        target.shakable = true;
                    }
                    else {
                        target.restrictTreeShaking();
                    }
                    target.namedExports.forEach(fileExport => {
                        const nameIsUsed = statement.usedNames.has(fileExport.name);
                        if (nameIsUsed) {
                            fileExport.isUsed = true;
                        }
                        else {
                            if (target.localExportUsageAmount.get(fileExport.name)
                                && target.localExportUsageAmount.get(fileExport.name) > 1) {
                                fileExport.isUsed = true;
                            }
                        }
                    });
                });
            }
        });
    }
    eachFile(fn) {
        return realm_utils_1.each(this.core.producerAbstraction.bundleAbstractions, (bundleAbstraction) => {
            return realm_utils_1.each(bundleAbstraction.packageAbstractions, (packageAbstraction) => {
                return realm_utils_1.each(packageAbstraction.fileAbstractions, (fileAbstraction) => {
                    return fn(fileAbstraction);
                });
            });
        });
    }
}
exports.TreeShake = TreeShake;

//# sourceMappingURL=TreeShake.js.map
