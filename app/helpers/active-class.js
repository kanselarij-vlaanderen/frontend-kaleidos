import { helper } from '@ember/component/helper';

export function activeClass(elements, objects) {
  let className = objects.class;
  let currentItem = elements.get('firstObject');
  let selectedItem = elements.get('lastObject');
  if(currentItem && selectedItem && currentItem.id === selectedItem.id) {
    return className + "--active";
  }
}

export default helper(activeClass);
