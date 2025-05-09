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

/**
 * @name replaceEnters
 * @description Vervangt enters van een string door spaties
 * @param {String} text De tekst om enters in te vervangen
 * @returns {String}
 */
function replaceEnters(text) {
  if (text) {
    text = text.replace(/\n/g, ' ');
    // dubbele spaties weghalen
    text = text.replace(/\s+/g, " ");
    return trimText(text);
  }
  return text;
}

/**
 * @name cleanPasteInputForTextarea
 * @description Paste event tegenhouden en de geplakte tekst aanpassen
 * @param {ClipboardEvent} pasteEvent het event {{on paste}}
 * @param {String} elementId Het element van de AuTextarea
 * @param {String} originalText De originele tekst van de AuTextArea (kan undefined of null zijn)
 * @returns {String}
 */
function cleanPasteInputForTextarea(pasteEvent, elementId, originalText = '') {
  pasteEvent.preventDefault();
  const textarea = document.getElementById(elementId);
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const data = pasteEvent.clipboardData.getData('text/plain');
  const cleanData = replaceEnters(data);
  // unicode karakters strippen kan hier
  return originalText.substring(0, start) + cleanData + originalText.substring(end);
}

export {
  trimText,
  replaceEnters,
  cleanPasteInputForTextarea
};
