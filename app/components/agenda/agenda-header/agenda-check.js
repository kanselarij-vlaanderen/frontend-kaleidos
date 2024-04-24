import Component from '@glimmer/component';
import { A } from '@ember/array';

/**
 * @argument onSave
 * @argument onCancel
 */

export default class AgendaHeaderAgendaCheck extends Component {
  get notaGroups() {
    const agendaitems = this.args.notas;
    if (agendaitems.length > 0) {
      const mandatees = agendaitems.firstObject.mandatees;
      let currentSubmittersArray = mandatees.sortBy('priority');
      let currentItemArray = A([]);
      const groups = [];
      groups.pushObject(currentItemArray);
      for (let index = 0; index < agendaitems.length; index++) {
        const agendaitem = agendaitems.objectAt(index);
        const mandatees = agendaitem.mandatees;
        const subm = mandatees.sortBy('priority');
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
  }
}

function equalContentArrays(array1, array2) {
  if (array1.length === array2.length) {
    return array1.every((elem) => array2.includes(elem));
  }
  return false;
}