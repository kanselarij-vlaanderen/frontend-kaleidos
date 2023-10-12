import VrNotulenName from 'frontend-kaleidos/utils/vr-notulen-name';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';

function formatDocuments(pieceRecords, isApproval) {
  const names = pieceRecords.map((record) => record.name);
  const simplifiedNames = names.map((name) => {
    if (isApproval) {
      return new VrNotulenName(name).vrNumberWithSuffix();
    }
    return new VRDocumentName(name).vrNumberWithSuffix();
  });
  const formatter = new Intl.ListFormat('nl-be');
  return `(${formatter.format(simplifiedNames)})`;
}

function generateBetreft(shortTitle, title = null, isApproval, documents, subcaseName = null) {

  return `${shortTitle}
  ${title ? `<br/>${title}` : ''}
  ${subcaseName ? `<br/>${capitalizeFirstLetter(subcaseName)}` : ''}
  ${documents && documents.length ? `<br/>${formatDocuments(documents, isApproval)}` : ''}`;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
  }


export {
  formatDocuments,
  generateBetreft,
}
