import { helper } from '@ember/component/helper';

export function agendaItemContainerType(curr) {
  let currItem = curr.get('firstObject');
  let selectedItem = curr.get('lastObject');
  if(currItem && selectedItem && currItem.id === selectedItem.id) {
    return 'active';
  } else {
    return 'inactive';
  }
}

export default helper(agendaItemContainerType);
