export function setHash(text) {
  if (text) {
    const hash = text.replaceAll(' ', '_');
    window.location.replace(`#${hash}`);
  }
}
