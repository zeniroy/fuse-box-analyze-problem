"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const realm_utils_1 = require("realm-utils");
const Bundle_1 = require("../../core/Bundle");
const Utils_1 = require("../../Utils");
const fs = require("fs");
class BundleWriter {
    constructor(core) {
        this.core = core;
        this.bundles = new Map();
    }
    getUglifyJSOptions() {
        const mainOptions = {};
        return Object.assign({}, this.core.opts.shouldUglify() || {}, mainOptions);
    }
    createBundle(name, code) {
        let bundle = new Bundle_1.Bundle(name, this.core.producer.fuse.copy(), this.core.producer);
        if (code) {
            bundle.generatedCode = new Buffer(code);
        }
        this.bundles.set(bundle.name, bundle);
        return bundle;
    }
    addShims() {
        const producer = this.core.producer;
        if (producer.fuse.context.shim) {
            const shims = [];
            for (let name in producer.fuse.context.shim) {
                let item = producer.fuse.context.shim[name];
                if (item.source) {
                    let shimPath = Utils_1.ensureUserPath(item.source);
                    if (!fs.existsSync(shimPath)) {
                        console.warn(`Shim erro: Not found: ${shimPath}`);
                    }
                    else {
                        shims.push(fs.readFileSync(shimPath).toString());
                    }
                }
            }
            if (shims.length) {
                this.createBundle("shims.js", shims.join("\n"));
            }
        }
    }
    uglifyBundle(bundle) {
        this.core.log.echoInfo(`Uglifying ${bundle.name}...`);
        const result = Utils_1.uglify(bundle.generatedCode, this.getUglifyJSOptions());
        if (result.error) {
            this.core.log
                .echoBoldRed(`  → Error during uglifying ${bundle.name}`)
                .error(result.error);
            throw result.error;
        }
        bundle.generatedCode = result.code;
        this.core.log.echoInfo(`Done Uglifying ${bundle.name}`);
        this.core.log.echoGzip(result.code);
    }
    process() {
        const producer = this.core.producer;
        const bundleManifest = {};
        this.addShims();
        producer.bundles.forEach(bundle => {
            this.bundles.set(bundle.name, bundle);
        });
        if (this.core.opts.isContained() && producer.bundles.size > 1) {
            this.core.opts.throwContainedAPIError();
        }
        let apiName2bake = this.core.opts.shouldBakeApiIntoBundle();
        if (!apiName2bake) {
            this.createBundle("api.js");
        }
        producer.bundles = this.bundles;
        const splitConfig = this.core.context.quantumSplitConfig;
        let splitFileOptions;
        if (splitConfig) {
            splitFileOptions = {
                c: { b: splitConfig.resolveOptions.browser || "./", "s": splitConfig.resolveOptions.server || "./" },
                i: {}
            };
            this.core.api.setBundleMapping(splitFileOptions);
        }
        let index = 1;
        const writeBundle = (bundle) => {
            return bundle.context.output.writeCurrent(bundle.generatedCode).then(output => {
                bundleManifest[bundle.name] = {
                    fileName: output.filename,
                    hash: output.hash,
                    absPath: output.path,
                    webIndexed: !bundle.quantumItem,
                    relativePath: output.relativePath
                };
                if (bundle.quantumItem) {
                    splitFileOptions.i[bundle.quantumItem.name] = [output.relativePath, bundle.quantumItem.entryId];
                }
            });
        };
        return realm_utils_1.each(producer.bundles, (bundle) => {
            if (bundle.name === "api.js") {
                bundle.webIndexPriority = 1000;
                if (this.core.opts.isContained()) {
                    this.core.opts.throwContainedAPIError();
                }
                bundle.generatedCode = new Buffer(this.core.api.render());
            }
            else {
                bundle.webIndexPriority = 1000 - index;
            }
            if (apiName2bake !== bundle.name) {
                if (this.core.opts.shouldUglify()) {
                    this.uglifyBundle(bundle);
                }
                index++;
                return writeBundle(bundle);
            }
        }).then(() => {
            if (apiName2bake) {
                let targetBundle = producer.bundles.get(apiName2bake);
                if (!targetBundle) {
                    this.core.log.echoBoldRed(`  → Error. Can't find bundle name ${targetBundle}`);
                }
                else {
                    const generatedAPIBundle = this.core.api.render();
                    if (this.core.opts.isContained()) {
                        targetBundle.generatedCode = new Buffer(targetBundle.generatedCode.toString().replace("/*$$CONTAINED_API_PLACEHOLDER$$*/", generatedAPIBundle.toString()));
                    }
                    else {
                        targetBundle.generatedCode = new Buffer(generatedAPIBundle + "\n" + targetBundle.generatedCode);
                    }
                    if (this.core.opts.shouldUglify()) {
                        this.uglifyBundle(targetBundle);
                    }
                }
                return writeBundle(targetBundle);
            }
        }).then(() => {
            const manifestPath = this.core.opts.getManifestFilePath();
            if (manifestPath) {
                this.core.producer.fuse.context.output.write(manifestPath, JSON.stringify(bundleManifest, null, 2), true);
            }
            if (this.core.opts.webIndexPlugin) {
                return this.core.opts.webIndexPlugin.producerEnd(producer);
            }
        }).then(() => {
            this.core.producer.bundles.forEach(bundle => {
                if (bundle.onDoneCallback) {
                    bundle.process.setFilePath(bundle.fuse.context.output.lastWrittenPath);
                    bundle.onDoneCallback(bundle.process);
                }
            });
        });
    }
}
exports.BundleWriter = BundleWriter;

//# sourceMappingURL=BundleWriter.js.map
