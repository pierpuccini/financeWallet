/**
 * @param {*} oldObject
 * @param {*} updatedProperties
 * @returns new object with no reference to old one
 */
export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties
  };
};

/**
 *
 * @param {*} value These are Requiered for validity function
 * @param {*} rules various types, see bellow
 * @param {*} required
 * @param {*} minLength
 * @param {*} maxLength
 * @param {*} isEmail
 * @param {*} isName
 * @param {*} specialNumber Obj. {min, max, step}
 * @returns
 */
export const checkValidity = (value, rules) => {
  let isValid = true;
  if (!rules) {
    return true;
  }

  if (rules.required) {
    isValid = value.trim() !== "" && isValid;
  }

  return isValid;
};
