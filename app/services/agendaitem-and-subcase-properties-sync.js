import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { setNotYetFormallyOk } from 'frontend-kaleidos/utils/agendaitem-utils';

/**
 * @description Set some properties on a model.
 * @param model Kan van het type agendaitem of subcase zijn
 * @param propertiesToSet de properties die we dienen aan te passen
 * @param resetFormallyOk Dient de formaliteit aangepast te worden of niet (default true)
 * @returns {Promise<*>}
 */
const setNewPropertiesToModel = async(model, propertiesToSet, resetFormallyOk = true) => {
  if (resetFormallyOk) {
    setNotYetFormallyOk(model);
  }

  const keys = Object.keys(propertiesToSet);
  for (const key of keys) {
    // Do not remove this seemingly unnecessary get!
    // If we don't fetch the relationship we want to set here before setting it,
    // for some unknown reason Ember will overwrite its value with the original
    // relationship when saving the model, in particular when it does the
    // preEditOrSaveCheck in the _saveAllowed method when fetching modifiedBy.
    await model.get(key);
    model.set(key, propertiesToSet[key]);
  }

  await model.save();
  return model.reload();
};

/**
 * @description Zet de modified date property van een agenda op basis van de doorgegeven agendaitem
 * @param agendaitem Het agendaitem om de agenda mee op te vragen.
 * @returns {Promise<void>}
 */
const setModifiedOnAgendaOfAgendaitem = async(agendaitem) => {
  const agenda = await agendaitem.agenda;
  const status = await agenda.status;
  const isDesignAgenda = status.isDesignAgenda;
  if (agenda && isDesignAgenda) {
    agenda.set('modified', new Date());
    await agenda.save();
  }
};

export default class AgendaitemAndSubcasePropertiesSyncService extends Service {
  @service store;

  async saveChanges(agendaitemOrSubcase, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, resetFormallyOk) {
    const item = agendaitemOrSubcase;
    const isAgendaitem = item.modelName === 'agendaitem';

    await item.preEditOrSaveCheck();
    if (isAgendaitem) {
      const agenda = await item.agenda;
      const agendaStatus = await agenda.status;
      const agendaActivity = await item.agendaActivity;
      const meeting = await agenda.createdFor;
      const finalAgenda = await meeting.agenda;
      if (agendaActivity && (agendaStatus.isDesignAgenda || finalAgenda === agenda)) {
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
