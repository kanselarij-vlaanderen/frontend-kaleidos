import Controller from '@ember/controller';
import { TrackedArray } from 'tracked-built-ins';
import { resource, use } from 'ember-resources';

function equalContentArrays(array1, array2) {
  if (array1.length === array2.length) {
    return array1.every((elem) => array2.includes(elem));
  }
  return false;
}

export default class AgendaPrintController extends Controller {
  @use notaGroups = resource(() => {
    const groups = new TrackedArray([]);
    
    const calculateNotaGroups = async () => {
      groups.length = 0;
      const agendaitems = this.model.notas;
      if (agendaitems.length > 0) {
        const mandatees = await agendaitems.at(0).mandatees;
        let currentSubmittersArray = mandatees.slice().sort((m1, m2) => m1.priority - m2.priority);
        let currentItemArray = [];
        groups.push(currentItemArray);
        for (let index = 0; index < agendaitems.length; index++) {
          const agendaitem = agendaitems.at(index);
          const mandatees = await agendaitem.mandatees;
          const subm = mandatees.slice().sort((m1, m2) => m1.priority - m2.priority);
          if (equalContentArrays(currentSubmittersArray, subm)) {
            currentItemArray.push(agendaitem);
          } else {
            currentItemArray = [agendaitem];
            groups.push(currentItemArray);
            currentSubmittersArray = subm;
          }
        }
        return groups;
      }
      return [];
    };
    calculateNotaGroups();
    return groups;
  });
}
