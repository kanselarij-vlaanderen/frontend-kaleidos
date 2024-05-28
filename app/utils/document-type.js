function capitalizeFirstLetter(string){ 
  const lowercaseString = string.toLowerCase();
  return lowercaseString.charAt(0).toUpperCase() + lowercaseString.slice(1);
}

/**
 * @param maybeType: A string of the name of the type we're trying to match
 * @param types: an array of all the document-types in the database
 */
function findDocType(maybeType, types) {
  let actualType;
  for (const type of types.slice()) {
    if (type.label === maybeType) {
      actualType = type;
      break;
    } else if (type.altLabel === maybeType) {
      actualType = type;
      break;
    }
  }
  return actualType;
}

export {
  capitalizeFirstLetter,
  findDocType
}