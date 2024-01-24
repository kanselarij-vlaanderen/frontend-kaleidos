export function removeObject(array, entry) {
  const index = array.indexOf(entry);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

export function removeObjects(array, entries) {
  entries.forEach((entry) => removeObject(array, entry));
}

export function addObject(array, entry) {
  const index = array.indexOf(entry);
  if (index === -1) {
    array.push(entry);
  }
}

export function addObjects(array, entries) {
  entries.forEach((entry) => addObject(array, entry));
}
