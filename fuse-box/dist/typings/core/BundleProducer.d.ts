/// <reference types="node" />
import { Bundle } from "./Bundle";
import { FuseBox } from "./FuseBox";
import { EventEmitter } from "events";
import { SharedCustomPackage } from "./SharedCustomPackage";
import { BundleRunner } from "./BundleRunner";
import { ServerOptions } from "../devServer/Server";
import { ProducerAbstraction, ProducerAbtractionOptions } from "../quantum/core/ProducerAbstraction";
export declare class BundleProducer {
    fuse: FuseBox;
    bundles: Map<string, Bundle>;
    hmrInjected: boolean;
    hmrAllowed: boolean;
    sharedEvents: EventEmitter;
    writeBundles: boolean;
    sharedCustomPackages: Map<string, SharedCustomPackage>;
    runner: BundleRunner;
    userEnvVariables: any;
    devServerOptions: ServerOptions;
    entryPackageName: string;
    entryPackageFile: string;
    private injectedCode;
    private chokidarOptions;
    private warnings;
    constructor(fuse: FuseBox);
    run(opts: {
        chokidar?: any;
        runType?: string;
    }): Promise<BundleProducer>;
    addUserProcessEnvVariables(data: any): void;
    printWarnings(): void;
    addWarning(key: string, message: string): void;
    devCodeHasBeenInjected(key: string): boolean;
    getDevInjections(): Map<string, string>;
    injectDevCode(key: string, code: string): void;
    sortBundles(): Bundle[];
    generateAbstraction(opts?: ProducerAbtractionOptions): Promise<ProducerAbstraction>;
    register(packageName: string, opts: any): Promise<void>;
    isShared(name: string): SharedCustomPackage;
    getSharedPackage(name: string): SharedCustomPackage;
    add(name: string, bundle: Bundle): void;
    watch(): void;
    /** Trigger bundles that are affected */
    protected onChanges(settings: Map<string, RegExp>, path: string): void;
}
