import CONSTANTS from "frontend-kaleidos/config/constants";


/**
 * @param conceptStore
 * @param maybeType: A string of the name of the type we're trying to match
 */
async function findDocType(conceptStore, maybeType) {
  const types = await conceptStore.queryAllByConceptScheme(CONSTANTS.CONCEPT_SCHEMES.DOCUMENT_TYPES);
  let actualType;
  const incomingType =  maybeType?.toLowerCase();
  if (!incomingType) {
    return;
  }
  for (const type of types.slice()) {
    if (type.label.toLowerCase() === incomingType) {
      actualType = type;
      break;
    } else if (type.altLabel.toLowerCase() === incomingType) {
      actualType = type;
      break;
    }
  }
  return actualType;
}

export {
  findDocType
}