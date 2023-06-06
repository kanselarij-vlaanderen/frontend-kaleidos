import sanitizeHtml from 'sanitize-html';
import {decode as decodeEntities} from 'html-entities';

/**
 * @name copyText
 * @description Copy text to the clipboard
 * @param {String|Array} sourceText The text that needs to be copied
 * @returns {Promise}
 */

function copyText(sourceText) {
  let resultText = '';

  if (typeof sourceText === 'string') {
    sourceText = [sourceText];
  }

  sourceText = sourceText.filter((item) => {
    return item;
  });

  sourceText.forEach((item, index) => {
    resultText += decodeEntities(
      sanitizeHtml(
        item
          .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n') // Replace p-tags with \n line breaks
          .replace(/<br\s*[/]?>/gi, '\n') // Replace br-tags with \n line break
          .trim() // Trim whitespaces at start & end of the string
        , {allowedTags: [], allowedAttributes: {}} // Remove all remaining tags from the string
      )
    );

    if (index !== sourceText.length - 1) {
      resultText += '\n\n';
    }
  });

  return navigator.clipboard.writeText(resultText);
}

export {
  copyText
};
