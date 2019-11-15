export default function (documents) {
  // Regex to match the numberVR of a document
  const regex = /^[A-z]{2}\s{1}[0-9]{4}\s{1}[0-9]{4}\s{1}[A-z]{3}[.][0-9]{4}.[0-9]+([ ]+\w*|$)/g;
  try{
    const documentsToSort = [];
    documents.map((document) => {
      documentsToSort.push(document);
    })

    return documentsToSort.sort(function(a, b) {
      const titleA = a.get('name');
      const titleB = b.get('name');
      if(!titleA.match(regex)) {
        return -1;
      }
      if(!titleB.match(regex)) {
        return 1;
      }

      const { name: nameA, number: numberA } = getNameAndNumber(titleA);
      const { name: nameB, number: numberB } = getNameAndNumber(titleB);
      
      // Compare the name first, then the number
      return compare(nameA,nameB) || compare(numberA, numberB);
    });
  } catch(e) {
    // Default sorting should anything go wrong, possible dead code
    return documents.sortBy('name');
  } 
}

const getNameAndNumber = function(title) {
  let number = title.slice(22).split(' ', 1)
  let name = title;
  if(isNaN(number)) {
    number = -1;
  }else {
    name = name.slice(0,21);
    number = parseInt(number);
  }
  return {name, number};
}
const compare = function(a, b) {
  if (a > b) return +1;
  if (a < b) return -1;
  return 0;
}