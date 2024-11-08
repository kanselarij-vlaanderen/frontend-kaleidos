import Component from '@glimmer/component';
import { action } from '@ember/object';
import { trackedTask } from 'reactiveweb/ember-concurrency';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { getNotaGroups } from 'frontend-kaleidos/utils/agendaitem-utils';
import { inject as service } from '@ember/service';

/**
 * @argument onSave
 * @argument onCancel
 */

export default class AgendaHeaderAgendaCheck extends Component {
  @service toaster;
  @service intl;

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
    try {
      const res = await fetch(`/document-naming/agenda/${this.args.agenda.id}`);
      const mappings = await res.json();
      // if service threw an error for some reason
      if (mappings.error) {
        throw new Error(mappings.error);
      }
      const mappingsMap = new Map(
        mappings.map(({ uri, generatedName }) => [uri, generatedName])
      );
      return mappingsMap;
    } catch (error) {
      // if service did not respond or self thrown errors
      this.toaster.error(
        error?.message || '',
        this.intl.t('error-while-fetching-document-naming-mapping')
      );
      return;
    }
  });

  fileNameMappings = trackedTask(this, this.getFileNameMappings);

  @action
  onSave() {
    this.args.onSave?.(this.fileNameMappings.value);
  }
}
