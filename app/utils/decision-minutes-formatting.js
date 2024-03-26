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
  const formatter = new Intl.ListFormat('nl-be');
  return `(${formatter.format(simplifiedNames)})`;
}

async function generateBetreft(
  shortTitle,
  title = null,
  isApproval,
  documents,
  subcaseName = null
) {
  const documentsWithoutBijlageTerInzage = await Promise.all(documents.map(async (document) => {
    const documentContainer = await document.documentContainer;
    const type = await documentContainer.type;
    if (type.uri !== CONSTANTS.DOCUMENT_TYPES.BIJLAGE_TER_INZAGE) {
      return document;
    }
    return null;
  }))
  const filteredDocuments = documentsWithoutBijlageTerInzage.filter((document) => document !== null);
  let betreft = '';
  betreft += `${shortTitle}`;
  betreft += title ? `<br/>${title}` : '';
  betreft += subcaseName ? `<br/>${capitalizeFirstLetter(subcaseName)}` : '';
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
