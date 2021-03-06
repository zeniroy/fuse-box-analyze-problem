/// <reference types="node" />
import { Server, ServerOptions } from "./../devServer/Server";
import { WorkFlowContext, Plugin } from "./WorkflowContext";
import { CollectionSource } from "./../CollectionSource";
import { BundleData } from "./../arithmetic/Arithmetic";
import { BundleProducer } from "./BundleProducer";
import { Bundle } from "./Bundle";
import { SplitConfig } from "./BundleSplit";
export interface FuseBoxOptions {
    homeDir?: string;
    modulesFolder?: string;
    tsConfig?: string;
    package?: any;
    cache?: boolean;
    target?: "browser" | "server" | "universal" | "electron";
    log?: boolean;
    globals?: {
        [packageName: string]: string;
    };
    plugins?: Plugin[];
    autoImport?: any;
    natives?: any;
    warnings?: boolean;
    shim?: any;
    writeBundles?: boolean;
    standalone?: boolean;
    sourceMaps?: boolean | {
        vendor?: boolean;
        inline?: boolean;
        project?: boolean;
        sourceRoot?: string;
    };
    rollup?: any;
    hash?: string | Boolean;
    ignoreModules?: string[];
    customAPIFile?: string;
    experimentalFeatures?: boolean;
    output?: string;
    debug?: boolean;
    files?: any;
    alias?: any;
    useJsNext?: boolean;
    runAllMatchedPlugins?: boolean;
}
/**
 *
 *
 * @export
 * @class FuseBox
 */
export declare class FuseBox {
    opts: FuseBoxOptions;
    static init(opts?: FuseBoxOptions): FuseBox;
    virtualFiles: any;
    collectionSource: CollectionSource;
    context: WorkFlowContext;
    producer: BundleProducer;
    /**
     * Creates an instance of FuseBox.
     *
     * @param {*} opts
     *
     * @memberOf FuseBox
     */
    constructor(opts?: FuseBoxOptions);
    triggerPre(): void;
    triggerStart(): void;
    triggerEnd(): void;
    triggerPost(): void;
    copy(): FuseBox;
    bundle(name: string, arithmetics?: string): Bundle;
    /** Starts the dev server and returns it */
    dev(opts?: ServerOptions, fn?: {
        (server: Server): void;
    }): void;
    /** Top priority is to register packages first */
    register(packageName: string, opts: any): void;
    run(opts?: any): Promise<BundleProducer>;
    /**
     * @description if configs diff, clear cache
     * @see constructor
     * @see WorkflowContext
     *
     * if caching is disabled, ignore
     * if already stored, compare
     * else, write the config for use later
     */
    compareConfig(config: FuseBoxOptions): void;
    /**
     * Bundle files only
     * @param files File[]
     */
    createSplitBundle(conf: SplitConfig): Promise<SplitConfig>;
    process(bundleData: BundleData, bundleReady?: () => any): Promise<{
        add(fileName: string, content: string | Buffer, sourceMap?: string): void;
        content: Buffer;
        sourceMap: string;
    }>;
    handleRollup(): false | (() => any);
    addShims(): void;
    initiateBundle(str: string, bundleReady?: any): Promise<void | {
        add(fileName: string, content: string | Buffer, sourceMap?: string): void;
        content: Buffer;
        sourceMap: string;
    }>;
}
