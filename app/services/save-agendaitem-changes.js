import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { setNewPropertiesToModel, setModifiedOnAgendaOfAgendaitem } from 'frontend-kaleidos/utils/agendaitem-utils';

export default class SaveAgendaitemChangesService extends Service {
  @service store;

  async saveChanges(agendaitemOrSubcase, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, resetFormallyOk) {
    const item = agendaitemOrSubcase;
    const isAgendaitem = item.modelName === 'agendaitem';

    await item.preEditOrSaveCheck();
    if (isAgendaitem) {
      const agenda = await item.agenda;
      const agendaStatus = await agenda.status;
      const agendaActivity = await item.agendaActivity;
      if (agendaActivity && (agendaStatus.isDesignAgenda || agendaStatus.isFinal)) {
        const agendaitemSubcase = await agendaActivity.subcase;
        await agendaitemSubcase.preEditOrSaveCheck();
        await setNewPropertiesToModel(agendaitemSubcase, propertiesToSetOnSubcase, false);
      }
      await setNewPropertiesToModel(item, propertiesToSetOnAgendaitem, resetFormallyOk);
      await setModifiedOnAgendaOfAgendaitem(item);
    } else {
      await setNewPropertiesToModel(item, propertiesToSetOnSubcase, false);
      const agendaitemsOnDesignAgendaToEdit = await this.store.query('agendaitem', {
        'filter[agenda-activity][subcase][:id:]': item.id,
        'filter[agenda][status][:uri:]': CONSTANTS.AGENDA_STATUSSES.DESIGN,
      });
      if (agendaitemsOnDesignAgendaToEdit?.length > 0) {
        await Promise.all(agendaitemsOnDesignAgendaToEdit.map(async(agendaitem) => {
          await setNewPropertiesToModel(agendaitem, propertiesToSetOnAgendaitem, resetFormallyOk);
          await setModifiedOnAgendaOfAgendaitem(agendaitem);
        }));
      }
    }
  }
}
