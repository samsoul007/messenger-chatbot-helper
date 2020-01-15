const utils = {
  isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
  },
  wait(p_iTime) {
    return (p_uData) => new Promise(resolve => {
      return setTimeout(() => {
        resolve(p_uData);
      }, p_iTime)
    })
  }
}

module.exports = utils
