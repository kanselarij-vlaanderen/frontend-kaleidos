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
    const agendaitems = this.get('model.notas');
    if (agendaitems.length > 0) {
      let currentSubmittersArray = agendaitems.firstObject.sortedMandatees;
      let currentItemArray = A([]);
      const groups = [];
      groups.pushObject(currentItemArray);
      for (let index = 0; index < agendaitems.length; index++) {
        const agendaitem = agendaitems.objectAt(index);
        const subm = agendaitem.sortedMandatees;
        if (equalContentArrays(currentSubmittersArray, subm)) {
          currentItemArray.pushObject(agendaitem);
        } else {
          currentItemArray = A([agendaitem]);
          groups.pushObject(currentItemArray);
          currentSubmittersArray = subm;
        }
      }
      return groups;
    }
    return A([]);
  }),

});
