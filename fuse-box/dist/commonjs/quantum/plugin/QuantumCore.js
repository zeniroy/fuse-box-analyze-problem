"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlatFileGenerator_1 = require("./FlatFileGenerator");
const realm_utils_1 = require("realm-utils");
const StatementModifaction_1 = require("./modifications/StatementModifaction");
const EnvironmentConditionModification_1 = require("./modifications/EnvironmentConditionModification");
const BundleWriter_1 = require("./BundleWriter");
const InteropModifications_1 = require("./modifications/InteropModifications");
const UseStrictModification_1 = require("./modifications/UseStrictModification");
const BundleAbstraction_1 = require("../core/BundleAbstraction");
const PackageAbstraction_1 = require("../core/PackageAbstraction");
const ResponsiveAPI_1 = require("./ResponsiveAPI");
const TypeOfModifications_1 = require("./modifications/TypeOfModifications");
const TreeShake_1 = require("./TreeShake");
const ProcessEnvModification_1 = require("./modifications/ProcessEnvModification");
const Utils_1 = require("../../Utils");
const ComputerStatementRule_1 = require("./ComputerStatementRule");
const Bundle_1 = require("../../core/Bundle");
const DynamicImportStatements_1 = require("./modifications/DynamicImportStatements");
const Hoisting_1 = require("./Hoisting");
class QuantumCore {
    constructor(producer, opts) {
        this.producer = producer;
        this.index = 0;
        this.writer = new BundleWriter_1.BundleWriter(this);
        this.requiredMappings = new Set();
        this.customStatementSolutions = new Set();
        this.computedStatementRules = new Map();
        this.splitFiles = new Set();
        this.opts = opts;
        this.api = new ResponsiveAPI_1.ResponsiveAPI(this);
        this.log = producer.fuse.context.log;
        this.log.echoBreak();
        this.log.groupHeader("Launching quantum core");
        if (this.opts.apiCallback) {
            this.opts.apiCallback(this);
        }
        this.context = this.producer.fuse.context;
    }
    solveComputed(path, rules) {
        this.customStatementSolutions.add(Utils_1.string2RegExp(path));
        if (rules && rules.mapping) {
            this.requiredMappings.add(Utils_1.string2RegExp(rules.mapping));
        }
        this.computedStatementRules.set(path, new ComputerStatementRule_1.ComputedStatementRule(path, rules));
    }
    getCustomSolution(file) {
        let fullPath = file.getFuseBoxFullPath();
        let computedRule = this.computedStatementRules.get(fullPath);
        if (computedRule) {
            return computedRule;
        }
    }
    consume() {
        this.log.echoInfo("Generating abstraction, this may take a while");
        return this.producer.generateAbstraction({
            quantumCore: this,
            customComputedStatementPaths: this.customStatementSolutions
        }).then(abstraction => {
            abstraction.quantumCore = this;
            this.producerAbstraction = abstraction;
            this.log.echoInfo("Abstraction generated");
            return realm_utils_1.each(abstraction.bundleAbstractions, (bundleAbstraction) => {
                return this.prepareFiles(bundleAbstraction);
            })
                .then(() => this.prepareSplitFiles())
                .then(() => abstraction);
        }).then(abstraction => {
            return realm_utils_1.each(abstraction.bundleAbstractions, (bundleAbstraction) => {
                return this.processBundle(bundleAbstraction);
            });
        })
            .then(() => this.treeShake())
            .then(() => this.render())
            .then(() => {
            this.compriseAPI();
            return this.writer.process();
        }).then(() => {
            this.printStat();
        });
    }
    printStat() {
        let apiStyle = "Optimised numbers (Best performance)";
        if (this.api.hashesUsed()) {
            apiStyle = "Hashes (Might cause issues)";
        }
        this.log.printOptions("Stats", {
            warnings: this.producerAbstraction.warnings.size,
            apiStyle: apiStyle,
            target: this.opts.optsTarget,
            uglify: this.opts.shouldUglify(),
            removeExportsInterop: this.opts.shouldRemoveExportsInterop(),
            removeUseStrict: this.opts.shouldRemoveUseStrict(),
            replaceProcessEnv: this.opts.shouldReplaceProcessEnv(),
            ensureES5: this.opts.shouldEnsureES5(),
            treeshake: this.opts.shouldTreeShake(),
        });
        if (this.opts.shouldShowWarnings()) {
            this.producerAbstraction.warnings.forEach(warning => {
                this.log.echoBreak();
                this.log.echoYellow("Warnings:");
                this.log.echoYellow("Your quantum bundle might not work");
                this.log.echoYellow(`  - ${warning.msg}`);
                this.log.echoGray("");
                this.log.echoGray("  * Set { warnings : false } if you want to hide these messages");
                this.log.echoGray("  * Read up on the subject http://fuse-box.org/page/quantum#computed-statement-resolution");
            });
        }
    }
    compriseAPI() {
        if (this.producerAbstraction.useComputedRequireStatements) {
            this.api.addComputedRequireStatetements();
        }
    }
    handleMappings(fuseBoxFullPath, id) {
        this.requiredMappings.forEach(regexp => {
            if (regexp.test(fuseBoxFullPath)) {
                this.api.addMapping(fuseBoxFullPath, id);
            }
        });
    }
    prepareSplitFiles() {
        let bundle;
        const splitConfig = this.context.quantumSplitConfig;
        if (!splitConfig) {
            return;
        }
        let items = splitConfig.getItems();
        items.forEach(quantumItem => {
            quantumItem.getFiles().forEach(file => {
                if (!this.producer.bundles.get(quantumItem.name)) {
                    this.log.echoInfo(`Create split bundle ${quantumItem.name}`);
                    const fusebox = this.context.fuse.copy();
                    const bundleName = splitConfig.resolve(quantumItem.name);
                    bundle = new Bundle_1.Bundle(bundleName, fusebox, this.producer);
                    this.producer.bundles.set(quantumItem.name, bundle);
                    bundle.webIndexed = false;
                    bundle.quantumItem = quantumItem;
                    const bnd = new BundleAbstraction_1.BundleAbstraction(quantumItem.name);
                    bnd.splitAbstraction = true;
                    let pkg = new PackageAbstraction_1.PackageAbstraction(file.packageAbstraction.name, bnd);
                    this.producerAbstraction.registerBundleAbstraction(bnd);
                    bundle.bundleAbstraction = bnd;
                    bundle.packageAbstraction = pkg;
                }
                else {
                    bundle = this.producer.bundles.get(quantumItem.name);
                }
                this.log.echoInfo(`Adding ${file.fuseBoxPath} to ${quantumItem.name}`);
                file.packageAbstraction.fileAbstractions.delete(file.fuseBoxPath);
                bundle.packageAbstraction.registerFileAbstraction(file);
                file.packageAbstraction = bundle.packageAbstraction;
            });
        });
    }
    prepareFiles(bundleAbstraction) {
        let entryId;
        if (this.producer.entryPackageFile && this.producer.entryPackageName) {
            entryId = `${this.producer.entryPackageName}/${this.producer.entryPackageFile}`;
        }
        const splitConfig = this.context.quantumSplitConfig;
        const globals = this.producer.fuse.context.globals;
        let globalsName;
        if (globals) {
            for (let i in globals) {
                globalsName = globals[i];
            }
        }
        bundleAbstraction.packageAbstractions.forEach(packageAbstraction => {
            packageAbstraction.fileAbstractions.forEach((fileAbstraction, key) => {
                let fileId = fileAbstraction.getFuseBoxFullPath();
                const id = this.index;
                this.handleMappings(fileId, id);
                this.index++;
                if (fileId === entryId) {
                    fileAbstraction.setEnryPoint(globalsName);
                }
                fileAbstraction.setID(id);
                const quantumItem = this.context.requiresQuantumSplitting(fileAbstraction.fuseBoxPath);
                if (quantumItem && splitConfig) {
                    if (quantumItem.entry === fileAbstraction.fuseBoxPath) {
                        quantumItem.entryId = fileAbstraction.getID();
                    }
                    this.api.useCodeSplitting();
                    fileAbstraction.referenceQuantumSplit(quantumItem);
                }
            });
        });
    }
    processBundle(bundleAbstraction) {
        this.log.echoInfo(`Process bundle ${bundleAbstraction.name}`);
        return realm_utils_1.each(bundleAbstraction.packageAbstractions, (packageAbstraction) => {
            const fileSize = packageAbstraction.fileAbstractions.size;
            this.log.echoInfo(`Process package ${packageAbstraction.name} `);
            this.log.echoInfo(`  Files: ${fileSize} `);
            return realm_utils_1.each(packageAbstraction.fileAbstractions, (fileAbstraction) => {
                return this.modify(fileAbstraction);
            });
        }).then(() => this.hoist());
    }
    treeShake() {
        if (this.opts.shouldTreeShake()) {
            const shaker = new TreeShake_1.TreeShake(this);
            return shaker.shake();
        }
    }
    render() {
        return realm_utils_1.each(this.producerAbstraction.bundleAbstractions, (bundleAbstraction) => {
            const generator = new FlatFileGenerator_1.FlatFileGenerator(this, bundleAbstraction);
            generator.init();
            return realm_utils_1.each(bundleAbstraction.packageAbstractions, (packageAbstraction) => {
                return realm_utils_1.each(packageAbstraction.fileAbstractions, (fileAbstraction) => {
                    return generator.addFile(fileAbstraction, this.opts.shouldEnsureES5());
                });
            }).then(() => {
                this.log.echoInfo(`Render bundle ${bundleAbstraction.name}`);
                const bundleCode = generator.render();
                this.producer.bundles.get(bundleAbstraction.name).generatedCode = new Buffer(bundleCode);
            });
        });
    }
    hoist() {
        if (!this.api.hashesUsed() && this.opts.shouldDoHoisting()) {
            let hoisting = new Hoisting_1.Hoisting(this);
            return hoisting.start();
        }
    }
    modify(file) {
        const modifications = [
            StatementModifaction_1.StatementModification,
            DynamicImportStatements_1.DynamicImportStatementsModifications,
            EnvironmentConditionModification_1.EnvironmentConditionModification,
            InteropModifications_1.InteropModifications,
            UseStrictModification_1.UseStrictModification,
            TypeOfModifications_1.TypeOfModifications,
            ProcessEnvModification_1.ProcessEnvModification,
        ];
        return realm_utils_1.each(modifications, (modification) => modification.perform(this, file));
    }
}
exports.QuantumCore = QuantumCore;

//# sourceMappingURL=QuantumCore.js.map
