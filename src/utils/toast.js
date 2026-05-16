let _dispatch = null;

export const _registerToastDispatch = (fn) => { _dispatch = fn; };

const show = (type, message, duration = 3800) => {
  if (_dispatch) _dispatch({ type, message, duration });
};

export const toast = {
  success: (msg, dur) => show('success', msg, dur),
  error:   (msg, dur) => show('error',   msg, dur),
  info:    (msg, dur) => show('info',    msg, dur),
  warning: (msg, dur) => show('warning', msg, dur),
};
