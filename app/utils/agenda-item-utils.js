import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';

export const cancelEdit = (item, propertiesToSet) => {
  const isSubcase = item.get('modelName') === 'subcase';
  if (item.get('hasDirtyAttributes')) {
    item.rollbackAttributes();
  }
  if (isSubcase) {
    item.belongsTo('type').reload();
    item.belongsTo('accessLevel').reload();
  }
  item.reload();
  propertiesToSet.forEach(prop => item.notifyPropertyChange(prop));
}

export const setNotYetFormallyOk = (itemToSet) => {
  if (itemToSet.get('formallyOk') != CONFIG.notYetFormallyOk) {
    itemToSet.set('formallyOk', CONFIG.notYetFormallyOk);
  }
}

export const setNewPropertiesToModel = async (model, propertiesToSet, resetFormallyOk = true) => {
  if (resetFormallyOk) {
    setNotYetFormallyOk(model);
  }

  const keys = Object.keys(propertiesToSet);
  keys.forEach(async function (key) {
    await model.get(key);
    model.set(key, propertiesToSet[key]);
  });

  return model.save().then((item) => {
    item.reload();
    return true;
  }).catch((e) => {
    throw(e);
  });
}

export const setModifiedOnAgendaOfAgendaitem = async (agendaitem) => {
  const agenda = await agendaitem.get('agenda');
  if (agenda) {
    agenda.set('modified', moment().utc().toDate());
    agenda.save();
  }
}

export const saveChanges = async (agendaitemOrSubcase, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, resetFormallyOk) => {
  const item = agendaitemOrSubcase;
  const isAgendaItem = item.get('modelName') === 'agendaitem';

  await item.preEditOrSaveCheck();
  if (isAgendaItem) {
    const isDesignAgenda = await item.get('isDesignAgenda');
    const agendaitemSubcase = await item.get('subcase');
    if (isDesignAgenda && agendaitemSubcase) {
      await agendaitemSubcase.preEditOrSaveCheck();
      await setNewPropertiesToModel(agendaitemSubcase, propertiesToSetOnSubcase, resetFormallyOk);
    }
    await setNewPropertiesToModel(item, propertiesToSetOnAgendaitem, resetFormallyOk);
    await setModifiedOnAgendaOfAgendaitem(item);
  } else {
    await setNewPropertiesToModel(item, propertiesToSetOnSubcase, resetFormallyOk);

    const agendaitemsOnDesignAgendaToEdit = await item.get('agendaitemsOnDesignAgendaToEdit');
    if (agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0) {
      await Promise.all(agendaitemsOnDesignAgendaToEdit.map(async (agendaitem) => {
        await setNewPropertiesToModel(agendaitem, propertiesToSetOnAgendaitem, resetFormallyOk);
        await setModifiedOnAgendaOfAgendaitem(agendaitem);
      }));
    }
  }
}
