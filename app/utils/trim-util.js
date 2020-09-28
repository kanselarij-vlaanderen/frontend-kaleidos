/**
 * @name trimText
 * @description Verwijderd spaties van een string
 * @param {String} text De tekst die getrimmed moet worden
 * @returns {String}
 */
function trimText(text) {
  if (text) {
    return text.trim();
  }
  return text;
}

export {
  trimText
};
