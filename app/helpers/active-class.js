import { helper } from '@ember/component/helper';

export function activeClass(elements) {
  let currentItem = elements.get('firstObject');
  let selectedItem = elements.get('lastObject');
  if(currentItem && selectedItem && currentItem.id === selectedItem.id) {
    return 'active';
  } else {
    return 'inactive';
  }}

export default helper(activeClass);
