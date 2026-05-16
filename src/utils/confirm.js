let _resolve = null;
let _showFn  = null;

export const _registerConfirm = (fn) => { _showFn = fn; };

export const showConfirm = (message, options = {}) =>
  new Promise((resolve) => {
    _resolve = resolve;
    _showFn?.({ message, ...options });
  });

export const _resolveConfirm = (value) => {
  _resolve?.(value);
  _resolve = null;
};
