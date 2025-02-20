const {
  undefined,
  Reflect: { defineProperty, getOwnPropertyDescriptor },
} = globalThis;

const noop = () => {};

// Similarly to `loader-esm.mjs` we want to make sure that there
// is a single reference for `hooks`. So we use a global variable
// so that we don't have to rely on module caching.
if (
  getOwnPropertyDescriptor(globalThis, "__APPMAP_HOOK_MOCHA__") === undefined
) {
  defineProperty(globalThis, "__APPMAP_HOOK_MOCHA__", {
    __proto__: null,
    value: {
      beforeEach: noop,
      afterEach: noop,
    },
    writable: true,
    configurable: true,
    enumerable: false,
  });
}

export const hooks = globalThis.__APPMAP_HOOK_MOCHA__;

export const mochaHooks = {
  beforeEach() {
    return hooks.beforeEach(this);
  },
  afterEach() {
    return hooks.afterEach(this);
  },
};
