import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { A } from '@ember/array';

function equalContentArrays(a, b) {
  if (a.length === b.length) {
    return a.every((elem) => b.includes(elem));
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
      for (let i = 0; i < agendaItems.length; i++) {
        const item = agendaItems.objectAt(i);
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
