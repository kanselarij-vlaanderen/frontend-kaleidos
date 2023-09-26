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
  const element = template.content.querySelector(`#${id}`);
  if (element) {
    element.innerHTML = newValue;
    return template.innerHTML;
  } else {
    console.debug(
      `No element with id "${id}" found, could not set innerHTML`
    );
    return htmlString;
  }
}
