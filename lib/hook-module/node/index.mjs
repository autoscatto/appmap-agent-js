import NativeModule from "./esm.mjs";
import CommonModule from "./cjs.mjs";

export default (dependencies) => {
  const { hookNativeModuleAsync } = NativeModule(dependencies);
  const { hookCommonModuleAsync, transformSourceDefault } =
    CommonModule(dependencies);
  return {
    transformSourceDefault,
    hookModuleAsync: (promise, client, state, configuration, box) =>
      Promise.all([
        hookNativeModuleAsync(promise, client, state, configuration, box),
        hookCommonModuleAsync(promise, client, state, configuration),
      ]),
  };
};
