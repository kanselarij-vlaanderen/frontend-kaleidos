import VrNotulenName from 'frontend-kaleidos/utils/vr-notulen-name';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';
import CONSTANTS from 'frontend-kaleidos/config/constants';

function formatDocuments(pieceRecords, isApproval) {
  const names = pieceRecords.map((record) => record.name);
  const simplifiedNames = [];
  let previousVrModel;
  for (const pieceName of names) {
    if (isApproval) {
      try {
        simplifiedNames.push(new VrNotulenName(pieceName).vrNumberWithSuffix());
      } catch {
        simplifiedNames.push(pieceName);
      }
      continue;
    }
    let vrModel;
    try {
      vrModel = new VRDocumentName(pieceName);
      const vrDateOnly = vrModel.vrDateOnly();
      // if the date part of the previous VR number is the same we don't repeat it
      const previousVrDate = previousVrModel?.vrDateOnly();
      if (previousVrDate === vrDateOnly) {
        simplifiedNames.push(vrModel.withoutDate());
      } else {
        simplifiedNames.push(vrModel.vrNumberWithSuffix());
      }
      previousVrModel = vrModel;
    } catch {
      simplifiedNames.push(pieceName);
      previousVrModel = null;
      continue;
    }
  }
  if (simplifiedNames.length) {
    const formatter = new Intl.ListFormat('nl-be');
    return `(${formatter.format(simplifiedNames)})`;
  }
  // no documents or all rectracted
  return '';
}

async function generateBetreft(
  shortTitle,
  title = null,
  isApproval,
  documents,
  subcaseName = null,
  agendaitemType,
  isRetracted = false
) {
  const documentsForBetreft = await Promise.all(documents.map(async (document) => {
    const accessLevel = await document.accessLevel;
    const documentContainer = await document.documentContainer;
    // it is possible to concurrently change the type, need to reload just in case
    const type = await documentContainer.belongsTo('type').reload();
    // this document type should not be shown in the documents list
    if (type?.uri === CONSTANTS.DOCUMENT_TYPES.BIJLAGE_TER_INZAGE) {
      return null;
    }
    // these accessLevels should not be shown in the documents list
    if (
      accessLevel?.uri === CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE ||
      (!isRetracted && accessLevel?.uri === CONSTANTS.ACCESS_LEVELS.INGETROKKEN)
    ) {
      return null;
    }
    return document;
  }))
  const isNota = agendaitemType?.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA;
  const filteredDocuments = documentsForBetreft.filter((document) => document !== null);
  let betreft = '';
  betreft += `${shortTitle}`;
  betreft += title ? `<br/>${title}` : '';
  betreft += (isNota && subcaseName) ? `<br/>${capitalizeFirstLetter(subcaseName)}` : '';
  betreft +=
    documents && documents.length
      ? `<br/>${formatDocuments(filteredDocuments, isApproval)}`
      : '';
  return betreft;
}

function generateApprovalText(shortTitle, title) {
  let approvalText = title || shortTitle || '';
  approvalText = approvalText.replace(
    /Goedkeuring van/i,
    'goedkeuring aan'
  );
  return `De Vlaamse Regering hecht haar ${approvalText}.`;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export { formatDocuments, generateBetreft, generateApprovalText };
