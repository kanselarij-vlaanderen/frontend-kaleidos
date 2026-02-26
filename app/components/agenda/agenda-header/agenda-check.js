import Component from '@glimmer/component';
import { action } from '@ember/object';
import { trackedTask } from 'reactiveweb/ember-concurrency';
import { task, all } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { getNotaGroups } from 'frontend-kaleidos/utils/agendaitem-utils';
import { inject as service } from '@ember/service';
import { getJsonPayloadOrThrow } from 'frontend-kaleidos/utils/json-util';

/**
 * @argument onSave
 * @argument onCancel
 */

export default class AgendaHeaderAgendaCheck extends Component {
  @service toaster;
  @service intl;
  @service agendaService;

  getAgendaitems = task(async () => {
    const notas = [];
    const announcements = [];
    const newNumberMappings = []; // how the numbering would be if approved in the current state
    let notaIndex = 1;
    let announcementIndex = 1;
    if (this.args.agenda) {
      const agendaitems = await this.args.agenda.agendaitems;
      const sortedAgendaitems = agendaitems?.slice().sort((a1, a2) => a1.number - a2.number);
      for (const agendaitem of sortedAgendaitems) {
        const type = await agendaitem.type;
        const previousVersion = await agendaitem.previousVersion;
        const isFormallyOk = [CONSTANTS.ACCEPTANCE_STATUSSES.OK].includes(agendaitem.formallyOk);
        if (type.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA) {
          notas.push(agendaitem);
          // gaps show in agendaitem numbering will get fixed on approving of the agenda
          // the reasoning: we only want new mapping if:
          // - the current index is different from the current number, this means there would be a gap
          // - based on formally ok
          // - if there is a previous version, there will a visual gap on agenda check view but not after approving (rollback the changes)
          if (agendaitem.number != notaIndex) {
            newNumberMappings.push({agendaitem, newNumber: notaIndex});
          }
          if (isFormallyOk || (!isFormallyOk && previousVersion)) {
            notaIndex++;
          }
        } else {
          announcements.push(agendaitem);
          if (agendaitem.number != announcementIndex) {
            newNumberMappings.push({agendaitem, newNumber: announcementIndex});
          }
          if (isFormallyOk || (!isFormallyOk && previousVersion)) {
            announcementIndex++;
          }
        }
      }
    }
    let notaGroups = await getNotaGroups(notas);
    return { notaGroups, announcements, newNumberMappings };
  });

  agendaitems = trackedTask(this, this.getAgendaitems);

  getFileNameMappings = task(async () => {
    try {
      const res = await fetch(`/document-naming/agenda/${this.args.agenda.id}`);
      const mappings = await getJsonPayloadOrThrow(res);
      // this is falsy if no mappings exist (nothing to do)
      return mappings;
    } catch (error) {
      this.toaster.error(
        error?.message || '',
        this.intl.t('error-while-fetching-document-naming-mapping')
      );
      return;
    }
  });

  fileNameMappings = trackedTask(this, this.getFileNameMappings);

  getNewAgendaitems = task(async () => {
    const previousAgenda = await this.args.agenda.previousVersion;
    let newAgendaitems;
    if (previousAgenda) {
      newAgendaitems = await this.agendaService.newAgendaItems(this.args.agenda.id, previousAgenda.id);
    }
    return newAgendaitems;
  });

  newAgendaitems = trackedTask(this, this.getNewAgendaitems);

  get fileNameMap() {
    // this is always truthy if mappings exist (empty or not) (to enable approve button)
    if (this.fileNameMappings.value) {
      return new Map(
        this.fileNameMappings.value?.map(({ uri, generatedName }) => [uri, generatedName])
      );
    }
    // this is falsy (to disabled approve button, not loaded yet or error)
    return null;
  }

  getNewPieces = task(async () => {
    const agendaitems = await this.args.agenda.agendaitems;
    const previousAgenda = await this.args.agenda.previousVersion;
    const pieces = [];
    const agendaitemNewPieces = agendaitems.map(async (agendaitem) => {
      if (previousAgenda) {
        const newPieces = await this.agendaService.changedPieces(
          this.args.agenda.id,
          previousAgenda.id,
          agendaitem.id
        );
        if (newPieces.length > 0) {
          pieces.push(...newPieces);
        }
      }
    });
    await all(agendaitemNewPieces);
    return pieces;
  });

  newPieces = trackedTask(this, this.getNewPieces);

  @action
  onSave() {
    this.args.onSave?.(this.fileNameMappings.value);
  }
}
