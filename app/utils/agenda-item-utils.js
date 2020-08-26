import CONFIG from 'fe-redpencil/utils/config';
import EmberObject from '@ember/object';
import moment from 'moment';

/**
 * Cancel the Edit.
 *
 * @param item
 * @param propertiesToSet
 */
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
  const keys = Object.keys(propertiesToSet);
  keys.forEach(async() => {
    keys.forEach((prop) => item.notifyPropertyChange(prop));
  });
};

/**
 * Set an item to not yet formally ok.
 *
 * @param itemToSet
 */
export const setNotYetFormallyOk = (itemToSet) => {
  if (itemToSet.get('formallyOk') !== CONFIG.notYetFormallyOk) {
    itemToSet.set('formallyOk', CONFIG.notYetFormallyOk);
  }
};

/**
 *@description Return een lijst met agendaitems die nog niet formeel ok zijn.
 * @param agendaitems
 */
export const getListOfAgendaitemsThatAreNotFormallyOk = (agendaitems) => {
  const agendaitemNotFormallyOk = (agendaitem) => agendaitem.get('formallyOk') !== CONFIG.formallyOk;
  return agendaitems.filter(agendaitemNotFormallyOk);
};

/**
 * Set some properties on a model.
 *
 * @param model
 * @param propertiesToSet
 * @param resetFormallyOk
 * @returns {Promise<*>}
 */
export const setNewPropertiesToModel = async(model, propertiesToSet, resetFormallyOk = true) => {
  if (resetFormallyOk) {
    setNotYetFormallyOk(model);
  }

  const keys = Object.keys(propertiesToSet);
  keys.forEach(async(key) => {
    await model.get(key);
    model.set(key, propertiesToSet[key]);
  });

  return model.save().then((item) => {
    item.reload();
    return true;
  })
    .catch((exception) => {
      throw (exception);
    });
};

/**
 * Set modified on Agenda of AgendaItem.
 *
 * @param agendaitem
 * @returns {Promise<void>}
 */
export const setModifiedOnAgendaOfAgendaitem = async(agendaitem) => {
  const agenda = await agendaitem.get('agenda');
  if (agenda) {
    agenda.set('modified', moment().utc()
      .toDate());
    agenda.save();
  }
};

/**
 * Save Changes on agenda item or subcase.
 *
 * @param agendaitemOrSubcase
 * @param propertiesToSetOnAgendaitem
 * @param propertiesToSetOnSubcase
 * @param resetFormallyOk
 * @returns {Promise<void>}
 */
export const saveChanges = async(agendaitemOrSubcase, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, resetFormallyOk) => {
  const item = agendaitemOrSubcase;
  const isAgendaItem = item.get('modelName') === 'agendaitem';

  await item.preEditOrSaveCheck();
  if (isAgendaItem) {
    const agenda = await item.get('agenda');
    const isDesignAgenda = await agenda.asyncCheckIfDesignAgenda();

    const agendaActivity = await item.get('agendaActivity');
    if (isDesignAgenda && agendaActivity) {
      const agendaitemSubcase = await agendaActivity.get('subcase');
      await agendaitemSubcase.preEditOrSaveCheck();
      await setNewPropertiesToModel(agendaitemSubcase, propertiesToSetOnSubcase, resetFormallyOk);
    }
    await setNewPropertiesToModel(item, propertiesToSetOnAgendaitem, resetFormallyOk);
    await setModifiedOnAgendaOfAgendaitem(item);
  } else {
    await setNewPropertiesToModel(item, propertiesToSetOnSubcase, resetFormallyOk);

    const agendaitemsOnDesignAgendaToEdit = await item.get('agendaitemsOnDesignAgendaToEdit');
    if (agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0) {
      await Promise.all(agendaitemsOnDesignAgendaToEdit.map(async(agendaitem) => {
        await setNewPropertiesToModel(agendaitem, propertiesToSetOnAgendaitem, resetFormallyOk);
        await setModifiedOnAgendaOfAgendaitem(agendaitem);
      }));
    }
  }
};

export const destroyApprovalsOfAgendaitem = async(agendaitem) => {
  const approvals = await agendaitem.get('approvals');
  if (approvals) {
    await Promise.all(approvals.map((approval) => approval.destroyRecord()));
  }
};

/**
 * For a given set of agenda items, will re-order them by their groupPriority
 * ⚠️ Word of caution, this mutates the original set!
 * @param {Array} agendaitems   Agenda items to mutate
 */
export const setCalculatedGroupPriorities = (agendaitems) => Promise.all(
  agendaitems.map(async(item) => {
    const mandatees = await item.get('mandatees');
    if (item.isApproval) {
      return;
    }
    if (mandatees.length === 0) {
      item.set('groupPriority', 20000000);
      return;
    }
    const mandateePriorities = mandatees.map((mandatee) => mandatee.priority);
    const minPrio = Math.min(...mandateePriorities);
    const minPrioIndex = mandateePriorities.indexOf(minPrio);
    delete mandateePriorities[minPrioIndex];
    let calculatedGroupPriority = minPrio;
    mandateePriorities.forEach((value) => {
      calculatedGroupPriority += value / 100;
    });
    item.set('groupPriority', calculatedGroupPriority);
  })
);

/**
 * For a given set of agendaitems, return an array of groups
 * Will eventually return the same amount of data
 * @param  {Array} agendaitems  Agenda items to parse from
 * @return {Array}              A list of groups
 */
export const groupAgendaitemsByGroupname = (agendaitems) => {
  const groups = [];
  agendaitems.map((agendaitem) => {
    const groupName = agendaitem.get('ownGroupName');
    const foundItem = groups.find((item) => item.groupName === groupName);

    if (!foundItem) {
      groups.push({
        groupName,
        groupPriority: agendaitem.groupPriority,
        agendaitems: [agendaitem],
      });
    } else {
      const foundIndex = groups.indexOf(foundItem);
      if (foundIndex >= 0) {
        groups[foundIndex].agendaitems.push(agendaitem);
      }
    }
  });
  return groups;
};

/**
 * For a set of agendaitems, will fetch the drafts, and will group them by priority
 * @param  {Array}  agendaitems   Agenda items to parse from
 * @return {Object}               An object containing drafts and groups
 */
export const parseDraftsAndGroupsFromAgendaitems = async(agendaitems) => {
  // Drafts are items without an approval or remark
  const draftAgendaitems = agendaitems.filter((item) => !item.showAsRemark && !item.isApproval);

  // Calculate the priorities on the drafts
  await setCalculatedGroupPriorities(draftAgendaitems);

  const groupedAgendaitems = Object.values(groupAgendaitemsByGroupname(draftAgendaitems));
  return {
    draftAgendaitems,
    groupedAgendaitems,
  };
};

/**
 * Given a set of grouped agendaitems, sort them by priority
 * @param  {Array}   groupedAgendaitems   A set containing all agendaitems grouped (see above functions)
 * @param  {Boolean} allowEmptyGroups     When true, empty groups are allowed
 * @return {Array}                        The input set, sorted by priority ASC
 */
export const sortByPriority = (groupedAgendaitems, allowEmptyGroups) => {
  let prevIndex = 0;
  let groupsArray = groupedAgendaitems;
  if (!allowEmptyGroups) {
    groupsArray = groupsArray.filter((group) => group.groupName && group.groupname !== 'Geen toegekende ministers');
  } else {
    groupsArray = groupsArray.filter((group) => group.groupname !== 'Geen toegekende ministers');
  }

  groupsArray = groupsArray.sortBy('groupPriority').map((item) => {
    item.agendaitems.map((agendaitem, index) => {
      prevIndex = index + prevIndex + 1;
      agendaitem.set('itemIndex', prevIndex);
    });
    return EmberObject.create(item);
  });

  return groupsArray;
};

/**
 * Given a set of agendaitems, set their priority
 * @name setAgendaItemsPriority
 * @param  {Array<agendaItem>}   agendaItems  Array of agendaitem objects to set priority on.
 * @param  {Boolean} isEditor     When true, the user is allowed to edit the trigger a recalculation of the priority.
 * @param {Boolean} isDesignAgenda  When true, the agenda is a designagenda.
 */
export const setAgendaItemsPriority = (agendaitems, isEditor, isDesignAgenda) => {
  if (isEditor && isDesignAgenda) {
    return agendaitems.map((agendaitem, index) => {
      agendaitem.set('priority', index + 1);
      agendaitem.save();
      return agendaitem;
    });
  }
};


