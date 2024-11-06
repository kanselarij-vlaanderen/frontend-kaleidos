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
  }

  return template.innerHTML;
}

/**
 *
 * @param {String} htmlString String containing valid HTML
 * @param {String} sectionId ID of the section element whose content needs to be replaced
 * @param {String} newValue New value of the element
 */
export function replaceBySectionId(htmlString, sectionId, newValue) {
  const template = document.createElement('template');
  htmlString = htmlString.trim();
  template.innerHTML = htmlString;
  const sectionElement = template.content.querySelector(`[data-section="${sectionId}"]`);
  if (sectionElement) {
    // innerHTML could be <p>oldValue<p>, replacing with newValue should also have <p>.
    // rdfa editor will automatically add <p> to plain text when missing
    sectionElement.innerHTML = newValue;
  }

  return template.innerHTML;
}
