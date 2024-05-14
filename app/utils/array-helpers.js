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

export function equalContentArrays(array1, array2) {
  if (array1.length === array2.length) {
    return array1.every((elem) => array2.includes(elem));
  }
  return false;
}
