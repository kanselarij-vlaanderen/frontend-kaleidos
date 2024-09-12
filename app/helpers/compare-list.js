import { helper } from '@ember/component/helper';

export default helper(function compareList([listA, listB]) {
  let difference = [];
  for (const item of listA) {
    const isInListB = listB.includes(item);
    if (!isInListB) {
      difference.push(item);
    }
  }
  return difference;
});
