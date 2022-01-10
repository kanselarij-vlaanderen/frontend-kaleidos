import { helper } from '@ember/component/helper';

export function activeClass([currentItem, selectedItem], objects) {
  const className = objects.class;

  if (currentItem && selectedItem && currentItem.id && selectedItem.id) {
    if (currentItem.id === selectedItem.id) {
      return className;
    }
  } else if (currentItem === selectedItem) {
    return className;
  }
}

export default helper(activeClass);
