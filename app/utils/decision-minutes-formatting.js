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

function generateBetreft(shortTitle, title, isApproval, documents) {
  return `${shortTitle}${title ? `<br/>${title}` : ''}${
    documents && documents.length ? `<br/>${formatDocuments(documents, isApproval)}` : ''
  }`;
}


export {
  formatDocuments,
  generateBetreft,
}
