export function removeObject(array, entry) {
  checkArray(array);
  const index = array.indexOf(entry);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

export function removeObjects(array, entries) {
  checkArray(array);
  entries.forEach((entry) => removeObject(array, entry));
}

export function addObject(array, entry) {
  checkArray(array);
  const index = array.indexOf(entry);
  if (index === -1) {
    array.push(entry);
  }
}

export function addObjects(array, entries) {
  checkArray(array);
  entries.forEach((entry) => addObject(array, entry));
}

function checkArray(array) {
  if (!array) {
    throw new Error('array-helpers: array cannot be undefined')
  }
}