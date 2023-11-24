import VrNotulenName from 'frontend-kaleidos/utils/vr-notulen-name';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';

function formatDocuments(pieceRecords, isApproval) {
  const names = pieceRecords.map((record) => record.name);
  const simplifiedNames = [];
  const vrNumbersFound = [];
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
    } catch {
      simplifiedNames.push(pieceName);
      continue;
    }
    const vrDateOnly = vrModel.vrDateOnly();
    // if the first part of the VR number is the same we don't repeat it
    if (!vrNumbersFound.includes(vrDateOnly)) {
      vrNumbersFound.push(vrDateOnly);
      simplifiedNames.push(vrModel.vrNumberWithSuffix());
      continue;
    }
    simplifiedNames.push(vrModel.withoutDate());
  }
  const formatter = new Intl.ListFormat('nl-be');
  return `(${formatter.format(simplifiedNames)})`;
}

function generateBetreft(
  shortTitle,
  title = null,
  isApproval,
  documents,
  subcaseName = null
) {
  let betreft = '';
  betreft += `${shortTitle}`;
  betreft += title ? `<br/>${title}` : '';
  betreft += subcaseName ? `<br/>${capitalizeFirstLetter(subcaseName)}` : '';
  betreft +=
    documents && documents.length
      ? `<br/>${formatDocuments(documents, isApproval)}`
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
