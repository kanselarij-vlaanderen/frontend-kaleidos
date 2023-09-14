/**
 *
 * @param {String} htmlString String containing valid HTML
 * @param {String} id ID of the element whose content needs to be replaced
 * @param {String} newValue New value of the element
 */
export function replaceById(htmlString, id, newValue) {
  const template = document.createElement('template');
  htmlString = htmlString.trim();
  template.innerHTML = htmlString;
  const secretaryElement = template.content.querySelector(`#${id}`);
  if (secretaryElement) {
    secretaryElement.innerHTML = newValue;
    return template.innerHTML;
  } else {
    console.debug(
      'Could not replace secretary in minutes piecePart. No HTMLElement with id "secretary" found.'
    );
    return htmlString;
  }
}
