export function setHash(pieceName) {
  const hash = pieceName.replaceAll(" ", "-");
  window.location.replace(`#${hash}`);
}
