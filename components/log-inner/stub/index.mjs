const { URL } = globalThis;
const { search: __search } = new URL(import.meta.url);

const { format, generateDeadcode } = await import(
  `../../util/index.mjs${__search}`
);

const checkFormat = (template, ...values) => {
  format(template, values);
};

export const logDebug = checkFormat;

export const logInfo = checkFormat;

export const logWarning = checkFormat;

export const logError = checkFormat;

export const reloadLogFile = generateDeadcode(
  "reloadLogFile called on log-inner/stub",
);
