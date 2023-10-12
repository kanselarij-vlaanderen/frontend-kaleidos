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
  let betreft = '';
  betreft += `${shortTitle}`;
  betreft += title ? `<br/>${title}` : '';
  betreft += subcaseName ? `<br/>${capitalizeFirstLetter(subcaseName)}` : '';
  betreft += (documents && documents.length) ? `<br/>${formatDocuments(documents, isApproval)}` : '';
  return betreft;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
  }


export {
  formatDocuments,
  generateBetreft,
}
