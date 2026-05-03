declare module "consts" {
  export const PACKAGE_ID: "lib-wrapper";
  export const PACKAGE_TITLE: "libWrapper";
  export const HOOKS_SCOPE: "libWrapper";
  export const IS_UNITTEST: boolean;
  export const PROPERTIES_CONFIGURABLE: boolean;
}
declare module "errors/errors" {
  export namespace ERRORS {
    export let base: ErrorConstructor;
    export let internal: ErrorConstructor;
    let _package: ErrorConstructor;
    export { _package as package };
    export let already_overridden: ErrorConstructor;
    export let invalid_chain: ErrorConstructor;
  }
}
declare module "utils/misc" {
  export function get_global_variable(varname: any): any;
  export function set_function_name(fn: any, name: any): void;
  export function decorate_name(name: any, suffix?: string): string;
  export function decorate_class_function_names(klass: any): void;
  export const global_eval: typeof eval;
  export function hash_string(str: any): number;
  export function is_promise(obj: any): boolean;
}
declare module "errors/error-utils" {
  export function is_error_object(obj: any): boolean;
  export function inject_packages_into_error(error: any, prepend_stack?: any): void;
}
declare module "errors/base_errors" {
  export class LibWrapperError extends Error {
    constructor(ui_msg: any, console_msg: any, ...args: any[]);
    get notification_verbosity(): any;
    ui_msg: any;
    console_msg: any;
    /**
     * Called if this error is unhandled
     */
    onUnhandled(): void;
  }
  export class LibWrapperInternalError extends LibWrapperError {
    static construct_message(technical_msg: any, package_info: any): string[];
    constructor(technical_msg: any, ...args: any[]);
    package_info: any;
    /**
     * Returns the package ID
     */
    get package_id(): any;
  }
  export class LibWrapperPackageError extends LibWrapperError {
    static get_community_support_message(): string;
    static construct_message(technical_msg: any, package_info: any): any[];
    package_info: any;
    /**
     * Returns the package ID
     */
    get package_id(): any;
  }
}
declare module "utils/settings" {
  export function getSetting(key: any, dflt?: any): any;
  export function getNotifyIssues(): any;
  export function getHighPerformanceMode(): any;
}
declare module "ui/notifications" {
  export class LibWrapperNotifications {
    static get ui_notifications_enabled(): boolean;
    static init(): void;
    static _ui(msg: any, verbosity?: any, add_title?: boolean): void;
    static ui(...args: any[]): void;
    static console_ui(ui_msg: any, console_msg: any, verbosity?: any, ...args: any[]): void;
    static conflict(package_info: any, other_info: any, potential: any, console_msg: any): void;
  }
}
declare module "ui/stats" {
  export class LibWrapperStats {
    static _collect_stats(): any;
    static init(): void;
    static register_package(package_info: any): void;
    static register_conflict(package_info: any, other_info: any, wrapper: any, ignored: any): void;
    static get conflicts(): Map<any, any>;
    static get packages(): Set<any>;
  }
}
declare module "ui/conflicts" {
  export class LibWrapperConflicts {
    static init(): void;
    static register_ignore(package_info: any, ignore_infos: any, targets: any, is_warning: any): void;
    static clear_ignores(): void;
    static _is_ignored_oneway(package_info: any, other_info: any, wrapper: any, is_warning: any): boolean;
    static _is_ignored(package_info: any, other_info: any, wrapper: any, is_warning: any): boolean;
    static register_conflict(package_info: any, other_info: any, wrapper: any, target: any, is_warning: any): boolean;
  }
}
declare module "errors/api_errors" {
  export class LibWrapperAlreadyOverriddenError extends LibWrapperError {
    static construct_message(package_info: any, conflicting_info: any, technical_msg: any): string[];
    constructor(package_info: any, conflicting_info: any, wrapper: any, target: any, ...args: any[]);
    package_info: any;
    conflicting_info: any;
    target: any;
    _wrapper: any;
    /**
     * Returns the package ID
     */
    get package_id(): any;
    /**
     * Deprecated since v1.6.0.0
     * Returns the package ID
     */
    get module(): any;
    /**
     * Returns the conflicting package ID
     */
    get conflicting_id(): any;
    /**
     * Deprecated since v1.6.0.0
     * Returns the conflicting package ID
     */
    get conflicting_module(): any;
  }
  export class LibWrapperInvalidWrapperChainError extends LibWrapperPackageError {
    constructor(wrapper: any, package_info: any, technical_msg: any, ...args: any[]);
    _wrapper: any;
  }
  import { LibWrapperError } from "errors/base_errors";
  import { LibWrapperPackageError } from "errors/base_errors";
}
declare module "errors/listeners" {
  export function onUnhandledError(error: any, prepend_stack?: any): void;
  export function init_error_listeners(): void;
}
declare module "errors/index" {
  export { };
}
declare module "lib/enums" {
  export const WRAPPER_TYPES: any;
  export const PERF_MODES: any;
}
declare module "lib/storage" {
  export const WRAPPERS: WrapperStorage;
  class WrapperStorage {
    index_for_id(id: any): number;
    index_for_wrapper(wrapper: any): number;
    get_next_id_pair(): number[];
    _delete(idx: any): void;
    _set(idx: any, wrapper: any): void;
    _deref(idx: any, ref: any): any;
    _get(idx: any): any;
    exists(wrapper: any, idx?: any): boolean;
    add(wrapper: any): void;
    remove(wrapper: any): void;
    clear(): void;
    data: Map<any, any>;
    next_id: number;
    wrappers(): Generator<any, void, unknown>;
    forEach(callbackFn: any): void;
    find(callbackFn: any): any;
    find_by_id(id: any): any;
  }
  export { };
}
declare module "lib/wrapper" {
  export class Wrapper {
    constructor(obj: any, fn_name: any, name?: any, package_info?: any);
    get_id(is_setter?: boolean): any;
    get name(): any;
    get frozen_names(): any[];
    get_name(is_setter?: boolean): any;
    get_names(is_setter?: boolean): any[];
    _add_name(name: any): void;
    names: any[];
    _callstack_name(nm: any, arg1?: any): string;
    fn_name: any;
    object: any;
    is_property: any;
    _wrapped_getter: () => any;
    _wrapped_setter: (v: any) => void;
    _wrapped: any;
    active: boolean;
    _outstanding_wrappers: number;
    _current_handler_id: number;
    _pending_wrapped_calls: any[];
    _pending_wrapped_calls_cnt: number;
    use_static_dispatch: boolean;
    _get_handler(): (...args: any[]) => any;
    _cached_handler: (...args: any[]) => any;
    _cached_handler_id: any;
    should_skip_wrappers(obj: any, handler_id: any, is_static_dispatch: any): boolean;
    skip_existing_handlers(): void;
    _get_static_dispatch_chain_cache(obj: any): any;
    _set_static_dispatch_chain_cache(obj: any, dispatch_chain: any): void;
    _static_dispatch_weakmap: WeakMap<object, any>;
    _static_dispatch_strongmap: Map<any, any>;
    clear_static_dispatch_chain_cache(): void;
    get_static_dispatch_chain(obj: any): any;
    _calc_use_static_dispatch(): boolean;
    update_use_static_dispatch(): void;
    _wrap(): void;
    unwrap(): void;
    _get_inherited_descriptor(): PropertyDescriptor;
    get_wrapped(obj: any, setter?: boolean, wrapped?: any): any;
    call_wrapped(state: any, obj: any, ...args: any[]): any;
    _pre_call_wrapped(obj: any, is_dynamic_dispatch: any): any;
    _post_call_wrapped(result: any, pend: any, is_dynamic_dispatch: any): any;
    _cleanup_call_wrapped(pend: any, is_dynamic_dispatch: any): void;
    call_wrapper(state: any, obj: any, ...args: any[]): any;
    _call_wrapper_update_state(state: any): void;
    _invalidate_state(state: any): void;
    _cleanup_call_wrapper_thrown(next_state: any, e: any): void;
    _cleanup_call_wrapper(result: any, next_state: any, data: any, fn_data: any, next_fn: any, obj: any, args: any): any;
    call_listeners(obj: any, is_setter: any, ...args: any[]): void;
    set_nonproperty(value: any, obj?: any): void;
    get_affected_packages(): any[];
    warn_classic_wrapper(): void;
    detected_classic_wrapper: any[];
    get_fn_data(is_setter: any, is_listener?: boolean, to_modify?: boolean): any[];
    _post_update_fn_data(): void;
    sort(setter?: any, listener?: any): void;
    add(data: any): void;
    remove(data: any): void;
    clear(): void;
    getter_data: any[];
    getter_listener_data: any[];
    setter_data: any[];
    setter_listener_data: any[];
    is_empty(): boolean;
  }
}
declare module "ui/settings" {
  export const PRIORITIES: Map<any, any>;
  export function load_priorities(value?: any): void;
  export class LibWrapperSettings {
    static _warnedAppV1: boolean;
    static init(): void;
    static get defaultOptions(): any;
    static showYesNoDialog(msg: any, yes_callback: any): void;
    constructor(object: {}, options: any);
    getActiveWrappers(): any[];
    getConflicts(): any[];
    getPackages(): {
      prioritized: any[];
      normal: any[];
      deprioritized: any[];
    };
    getData(): {
      about: {
        name: string;
        version: any;
        collect_stats: any;
        translation_credits: any;
        support: any[];
      };
      wrappers: any[];
      conflicts: any[];
      packages: {
        prioritized: any[];
        normal: any[];
        deprioritized: any[];
      };
      show_ignored_conflicts: any;
    };
    activateListeners(html: any): void;
    _updateObject(ev: any, formData: any): Promise<void>;
  }
}
// declare module "lib/api" {
export function _create_wrapper_from_object(obj: any, fn_name: any, name?: any, package_info?: any): Wrapper;
export function _find_wrapper_by_name(_name: any, package_info?: any): any;
export function _clear(target: any): void;
export function _unwrap_all(): void;
export class libWrapper {
  /**
   * Get libWrapper version
   * @returns {string}  libWrapper version in string form, i.e. "<MAJOR>.<MINOR>.<PATCH>.<SUFFIX><META>"
   */
  static get version(): string;
  /**
   * Get libWrapper version
   * @returns {[number,number,number,number,string]}  libWrapper version in array form, i.e. [<MAJOR>, <MINOR>, <PATCH>, <SUFFIX>, <META>]
   */
  static get versions(): [number, number, number, number, string];
  /**
   * Get the Git version identifier.
   * @returns {string}  Git version identifier, usually 'HEAD' or the commit hash.
   */
  static get git_version(): string;
  /**
   * @returns {boolean}  The real libWrapper module will always return false. Fallback implementations (e.g. poly-fill / shim) should return true.
   */
  static get is_fallback(): boolean;
  static get LibWrapperError(): ErrorConstructor;
  static get Error(): ErrorConstructor;
  static get LibWrapperInternalError(): ErrorConstructor;
  static get InternalError(): ErrorConstructor;
  static get LibWrapperPackageError(): ErrorConstructor;
  static get PackageError(): ErrorConstructor;
  static get LibWrapperAlreadyOverriddenError(): ErrorConstructor;
  static get AlreadyOverriddenError(): ErrorConstructor;
  static get LibWrapperInvalidWrapperChainError(): ErrorConstructor;
  static get InvalidWrapperChainError(): ErrorConstructor;
  static get onUnhandledError(): (error: any, prepend_stack?: any) => void;
  static get WRAPPER(): any;
  static get MIXED(): any;
  static get OVERRIDE(): any;
  static get LISTENER(): any;
  static get PERF_NORMAL(): any;
  static get PERF_AUTO(): any;
  static get PERF_FAST(): any;
  /**
   * Test for a minimum libWrapper version.
   * First introduced in v1.4.0.0.
   *
   * @param {number} major   Minimum major version
   * @param {number} minor   [Optional] Minimum minor version. Default is 0.
   * @param {number} patch   [Optional] Minimum patch version. Default is 0.
   * @param {number} suffix  [Optional] Minimum suffix version. Default is 0.
   * @returns {boolean}      Returns true if the libWrapper version is at least the queried version, otherwise false.
   */
  static get version_at_least(): boolean;
  /**
   * Register a new wrapper.
   * Important: If called before the 'init' hook, this method will fail.
   *
   * In addition to wrapping class methods, there is also support for wrapping methods on specific object instances, as well as class methods inherited from parent classes.
   * However, it is recommended to wrap methods directly in the class that defines them whenever possible, as inheritance/instance wrapping is less thoroughly tested and will incur a performance penalty.
   *
   * Triggers FVTT hook 'libWrapper.Register' when successful.
   *
   * Returns a unique numeric target identifier, which can be used as a replacement for 'target' in future calls to 'libWrapper.register' and 'libWrapper.unregister'.
   *
   * @param {string} package_id  The package identifier, i.e. the 'id' field in your module/system/world's manifest.
   *
   * @param {number|string} target The target identifier, specifying which wrapper should be registered.
   *
   *   This can be either:
   *     1. A unique target identifier obtained from a previous 'libWrapper.register' call.
   *     2. A string containing the path to the function you wish to add the wrapper to, starting at global scope, for example 'SightLayer.prototype.updateToken'.
   *
   *   Support for the unique target identifiers (option #1) was added in v1.11.0.0, with previous versions only supporting option #2.
   *
   *   Since v1.8.0.0, the string path (option #2) can contain string array indexing.
   *   For example, 'CONFIG.Actor.sheetClasses.character["dnd5e.ActorSheet5eCharacter"].cls.prototype._onLongRest' is a valid path.
   *   It is important to note that indexing in libWrapper does not work exactly like in JavaScript:
   *     - The index must be a single string, quoted using the ' or " characters. It does not support e.g. numbers or objects.
   *     - A backslash \ can be used to escape another character so that it loses its special meaning, e.g. quotes i.e. ' and " as well as the character \ itself.
   *
   *   By default, libWrapper searches for normal methods or property getters only. To wrap a property's setter, append '#set' to the name, for example 'SightLayer.prototype.blurDistance#set'.
   *
   * @param {function} fn        Wrapper function. The first argument will be the next function in the chain, except for 'OVERRIDE' wrappers.
   *                             The remaining arguments will correspond to the parameters passed to the wrapped method.
   *
   * @param {string} type        [Optional] The type of the wrapper. Default is 'MIXED'.
   *
   *   The possible types are:
   *
   *   'LISTENER' / libWrapper.LISTENER:
   * 	   Use this to register a listener function. This function will be called immediately before the target is called, but is not part of the call chain.
   *     Use when you just need to know a method is being called and the parameters used for the call, without needing to modify the parameters or execute any
   *     code after the method finishes execution.
   *     Listeners will always be called first, before any other type, and should be used whenever possible as they have a virtually zero chance of conflict.
   *     Note that asynchronous listeners are *not* awaited before execution is allowed to proceed.
   *     First introduced in v1.13.0.0.
   *
   *   'WRAPPER' / libWrapper.WRAPPER:
   *     Use if your wrapper will *always* continue the chain.
   *     This type has priority over MIXED and OVERRIDE. It should be preferred over those whenever possible as it massively reduces the likelihood of conflicts.
   *     Note that the library will auto-detect if you use this type but do not call the original function, and automatically unregister your wrapper.
   *
   *   'MIXED' / libWrapper.MIXED:
   *     Default type. Your wrapper will be allowed to decide whether it continue the chain or not.
   *     These will always come after 'WRAPPER'-type wrappers. Order is not guaranteed, but conflicts will be auto-detected.
   *
   *   'OVERRIDE' / libWrapper.OVERRIDE:
   *     Use if your wrapper will *never* continue the chain. This type has the lowest priority, and will always be called last.
   *     If another package already has an 'OVERRIDE' wrapper registered to the same method, using this type will throw a <libWrapper.ERRORS.package> exception.
   *     Catching this exception should allow you to fail gracefully, and for example warn the user of the conflict.
   *     Note that if the GM has explicitly given your package priority over the existing one, no exception will be thrown and your wrapper will take over.
   *
   * @param {Object} options [Optional] Additional options to libWrapper.
   *
   * @param {boolean} options.chain [Optional] If 'true', the first parameter to 'fn' will be a function object that can be called to continue the chain.
   *   This parameter must be 'true' when registering non-OVERRIDE wrappers.
   *   Default is 'false' if type=='OVERRIDE', otherwise 'true'.
   *   First introduced in v1.3.6.0.
   *
   * @param {string} options.perf_mode [Optional] Selects the preferred performance mode for this wrapper. Default is 'AUTO'.
   *   It will be used if all other wrappers registered on the same target also prefer the same mode, otherwise the default will be used instead.
   *   This option should only be specified with good reason. In most cases, using 'AUTO' in order to allow the GM to choose is the best option.
   *   First introduced in v1.5.0.0.
   *
   *   The possible modes are:
   *
   *   'NORMAL' / libWrapper.PERF_NORMAL:
   *     Enables all conflict detection capabilities provided by libWrapper. Slower than 'FAST'.
   *     Useful if wrapping a method commonly modified by other packages, to ensure most issues are detected.
   *     In most other cases, this mode is not recommended and 'AUTO' should be used instead.
   *
   *   'FAST' / libWrapper.PERF_FAST:
   *     Disables some conflict detection capabilities provided by libWrapper, in exchange for performance. Faster than 'NORMAL'.
   *     Will guarantee wrapper call order and per-package prioritization, but fewer conflicts will be detectable.
   *     This performance mode will result in comparable performance to traditional non-libWrapper wrapping methods.
   *     Useful if wrapping a method called repeatedly in a tight loop, for example 'WallsLayer.testWall'.
   *     In most other cases, this mode is not recommended and 'AUTO' should be used instead.
   *
   *   'AUTO' / libWrapper.PERF_AUTO:
   *     Default performance mode. If unsure, choose this mode.
   *     Will allow the GM to choose which performance mode to use.
   *     Equivalent to 'FAST' when the libWrapper 'High-Performance Mode' setting is enabled by the GM, otherwise 'NORMAL'.
   *
   * @param {any[]} options.bind [Optional] An array of parameters that should be passed to 'fn'.
   *
   *   This allows avoiding an extra function call, for instance:
   *     libWrapper.register(PACKAGE_ID, "foo", function(wrapped, ...args) { return someFunction.call(this, wrapped, "foo", "bar", ...args) });
   *   becomes
   *     libWrapper.register(PACKAGE_ID, "foo", someFunction, "WRAPPER", {bind: ["foo", "bar"]});
   *
   *   First introduced in v1.12.0.0.
   *
   * @returns {number} Unique numeric 'target' identifier which can be used in future 'libWrapper.register' and 'libWrapper.unregister' calls.
   *   Added in v1.11.0.0.
   */
  static register<t extends Function>(package_id: string, target: number | string, fn: (wrapped: t, ...args: Parameters<t>) => ReturnType<t>, type?: string, options?: {
    chain: boolean;
    perf_mode: string;
    bind: any[];
  }): number;
  /**
   * Unregister an existing wrapper.
   *
   * Triggers FVTT hook 'libWrapper.Unregister' when successful.
   *
   * @param {string} package_id     The package identifier, i.e. the 'id' field in your module/system/world's manifest.
   *
   * @param {number|string} target  The target identifier, specifying which wrapper should be unregistered.
   *
   *   This can be either:
   *     1. A unique target identifier obtained from a previous 'libWrapper.register' call. This is the recommended option.
   *     2. A string containing the path to the function you wish to remove the wrapper from, starting at global scope, with the same syntax as the 'target' parameter to 'libWrapper.register'.
   *
   *   Support for the unique target identifiers (option #1) was added in v1.11.0.0, with previous versions only supporting option #2.
   *   It is recommended to use option #1 if possible, in order to guard against the case where the class or object at the given path is no longer the same as when `libWrapper.register' was called.
   *
   * @param {function} fail         [Optional] If true, this method will throw an exception if it fails to find the method to unwrap. Default is 'true'.
   */
  static unregister(package_id: string, target: number | string, fail?: Function): void;
  /**
   * Unregister all wrappers created by a given package.
   *
   * Triggers FVTT hook 'libWrapper.UnregisterAll' when successful.
   *
   * @param {string} package_id  The package identifier, i.e. the 'id' field in your module/system/world's manifest.
   */
  static unregister_all(package_id: string): void;
  /**
   * Ignore conflicts matching specific filters when detected, instead of warning the user.
   *
   * This can be used when there are conflict warnings that are known not to cause any issues, but are unable to be resolved.
   * Conflicts will be ignored if they involve both 'package_id' and one of 'ignore_ids', and relate to one of 'targets'.
   *
   * Note that the user can still see which detected conflicts were ignored, by toggling "Show ignored conflicts" in the "Conflicts" tab in the libWrapper settings.
   *
   * First introduced in v1.7.0.0.
   *
   * @param {string}            package_id  The package identifier, i.e. the 'id' field in your module/system/world's manifest. This will be the package that owns this ignore entry.
   *
   * @param {(string|string[])} ignore_ids  Other package ID(s) with which conflicts should be ignored.
   *
   * @param {(string|string[])} targets     Target(s) for which conflicts should be ignored, corresponding to the 'target' parameter to 'libWrapper.register'.
   *   This method does not accept the unique target identifiers returned by 'libWrapper.register'.
   *
   * @param {Object} options [Optional] Additional options to libWrapper.
   *
   * @param {boolean} options.ignore_errors  [Optional] If 'true', will also ignore confirmed conflicts (i.e. errors), rather than only potential conflicts (i.e. warnings).
   *   Be careful when setting this to 'true', as confirmed conflicts are almost certainly something the user should be made aware of.
   *   Defaults to 'false'.
   */
  static ignore_conflicts(package_id: string, ignore_ids: (string | string[]), targets: (string | string[]), options?: {
    ignore_errors: boolean;
  }): void;
}
import { Wrapper } from "lib/wrapper";
// }