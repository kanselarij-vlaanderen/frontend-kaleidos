import Controller from '@ember/controller';
import { A } from '@ember/array';

function equalContentArrays(array1, array2) {
  if (array1.length === array2.length) {
    return array1.every((elem) => array2.includes(elem));
  }
  return false;
}

export default class AgendaPrintController extends Controller {
  get notaGroups() {
    const agendaitems = this.model.notas;
    if (agendaitems.length > 0) {
      const mandatees = agendaitems.at(0).mandatees;
      let currentSubmittersArray = mandatees.slice().sort((m1, m2) => m1.priority - m2.priority);
      let currentItemArray = A([]);
      const groups = [];
      groups.push(currentItemArray);
      for (let index = 0; index < agendaitems.length; index++) {
        const agendaitem = agendaitems.at(index);
        const mandatees = agendaitem.mandatees;
        const subm = mandatees.slice().sort((m1, m2) => m1.priority - m2.priority);
        if (equalContentArrays(currentSubmittersArray, subm)) {
          currentItemArray.push(agendaitem);
        } else {
          currentItemArray = A([agendaitem]);
          groups.push(currentItemArray);
          currentSubmittersArray = subm;
        }
      }
      return groups;
    }
    return A([]);
  }
}
