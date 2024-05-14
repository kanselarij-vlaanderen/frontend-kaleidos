import Component from '@glimmer/component';
import { trackedTask } from 'reactiveweb/ember-concurrency';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { getNotaGroups } from 'frontend-kaleidos/utils/agendaitem-utils';

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
    let notaGroups = await getNotaGroups(notas);
    return { notaGroups, announcements };
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

}
