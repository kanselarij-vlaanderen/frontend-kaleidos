import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { A } from '@ember/array';

function equalContentArrays(array1, array2) {
  if (array1.length === array2.length) {
    return array1.every((elem) => array2.includes(elem));
  }
  return false;
}

export default Controller.extend({

  notaGroups: computed('model.notas.@each.sortedMandatees', function() {
    const agendaItems = this.get('model.notas');
    if (agendaItems.length > 0) {
      let currentSubmittersArray = agendaItems.firstObject.sortedMandatees;
      let currentItemArray = A([]);
      const groups = [];
      groups.pushObject(currentItemArray);
      for (let index = 0; index < agendaItems.length; index++) {
        const item = agendaItems.objectAt(index);
        const subm = item.sortedMandatees;
        if (equalContentArrays(currentSubmittersArray, subm)) {
          currentItemArray.pushObject(item);
        } else {
          currentItemArray = A([item]);
          groups.pushObject(currentItemArray);
          currentSubmittersArray = subm;
        }
      }
      return groups;
    }
    return A([]);
  }),

});
