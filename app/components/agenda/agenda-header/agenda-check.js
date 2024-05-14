import Component from '@glimmer/component';
import { A } from '@ember/array';
import { trackedTask } from 'reactiveweb/ember-concurrency';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument onSave
 * @argument onCancel
 */

export default class AgendaHeaderAgendaCheck extends Component {

  getAgendaitems = task(async () => {
    const notas = [];
    const announcements = [];
    if (this.args.agenda) {
      const agendaitems = await this.args.agenda.agendaitems;
      const sortedAgendaitems = agendaitems?.slice().sort((a1, a2) => a1.number - a2.number);
      for (const agendaitem of sortedAgendaitems) {
        const type = await agendaitem.type;
        if (type.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA) {
          notas.push(agendaitem);
        } else {
          announcements.push(agendaitem);
        }
      }
    }
    return { notas, announcements };
  });

  agendaitems = trackedTask(this, this.getAgendaitems);

  getFileNameMappings = task(async () => {
    const res = await fetch(`/document-naming/agenda/${this.args.agenda.id}`);
    const mappings = await res.json();
    const mappingsMap = new Map(
      mappings.map(({ uri, newTitle }) => [uri, newTitle])
    );

    return mappingsMap;
  });

  fileNameMappings = trackedTask(this, this.getFileNameMappings);

  get notaGroups() {
    const agendaitems = this.agendaitems.value?.notas;
    if (agendaitems?.length > 0) {
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
