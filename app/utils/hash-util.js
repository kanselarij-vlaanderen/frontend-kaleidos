import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';

export function setHash(pieceName) {
  const hash = pieceName.replaceAll(" ", "-");
  window.location.hash = hash;
}