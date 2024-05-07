export function setHash(text) {
  if (text) {
    let hash = text.replaceAll(' ', '_');
    hash = hash.replaceAll('/', '-');
    window.location.replace(`#${hash}`);
  }
}
