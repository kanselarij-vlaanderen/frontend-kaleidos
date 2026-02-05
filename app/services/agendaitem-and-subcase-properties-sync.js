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
  if (resetFormallyOk && model.modelName === 'agendaitem') {
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
  const status = await agenda.belongsTo('status').reload();
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
      // Only push certain changes to subcase if we are on design agenda
      // or if we are on the final agenda on a closed meeting
      // This prevents changes on older agenda versions (fe. agenda B and subcase have info that agenda C has not)
      // For legacy edits, this means you could edit the agendaitem without reopening and changes will reflect on subcase
      if (agendaActivity && (agendaStatus.isDesignAgenda || finalAgenda === agenda)) {
        const agendaitemSubcase = await agendaActivity.subcase;
        await agendaitemSubcase.preEditOrSaveCheck();
        await setNewPropertiesToModel(agendaitemSubcase, propertiesToSetOnSubcase, false);
      }
      // formally ok reset only on design agenda
      await setNewPropertiesToModel(item, propertiesToSetOnAgendaitem, agendaStatus.isDesignAgenda ? resetFormallyOk : false);
      await setModifiedOnAgendaOfAgendaitem(item);
    } else {
      await setNewPropertiesToModel(item, propertiesToSetOnSubcase, false);
      // in normal cases, only 1 agendaitem should exist on a design agenda.
      // only in special cases, 2 agendaitems can exist on different meetings (different agenda-activity)
      // fe. agendaitem gets retracted on friday agenda to be rushed on a wednesday agenda.
      // Normally we don't want to update the friday agenda anymore then.
      // this query will only get the agendaitem on a design agenda of the latest agenda-activity
      // should result in max 1 agendaitem or 0 (everything approved but changes happen)
      const agendaitemOnDesignAgenda = await this.store.queryOne('agendaitem', {
        'filter[agenda-activity][subcase][:id:]': item.id, 
        'filter[agenda][status][:uri:]': CONSTANTS.AGENDA_STATUSSES.DESIGN,
        'filter[:has-no:next-version]': 't',
        sort: '-agenda-activity.start-date,-created',
      });
      if (agendaitemOnDesignAgenda?.id) {
        await setNewPropertiesToModel(agendaitemOnDesignAgenda, propertiesToSetOnAgendaitem, resetFormallyOk);
        await setModifiedOnAgendaOfAgendaitem(agendaitemOnDesignAgenda);
      }
    }
  }
}
