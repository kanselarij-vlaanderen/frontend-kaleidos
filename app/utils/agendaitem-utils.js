import CONFIG from 'fe-redpencil/utils/config';
import EmberObject from '@ember/object';
import moment from 'moment';

/**
 * Cancel the Edit.
 * @param agendaitemOrSubcase
 * @param propertiesToSet
 */
export const cancelEdit = (agendaitemOrSubcase, propertiesToSet) => {
  const isSubcase = agendaitemOrSubcase.get('modelName') === 'subcase';
  if (agendaitemOrSubcase.get('hasDirtyAttributes')) {
    agendaitemOrSubcase.rollbackAttributes();
  }
  if (isSubcase) {
    agendaitemOrSubcase.belongsTo('type').reload();
    agendaitemOrSubcase.belongsTo('accessLevel').reload();
  }
  agendaitemOrSubcase.reload();
  const keys = Object.keys(propertiesToSet);
  keys.forEach(async() => {
    keys.forEach((prop) => agendaitemOrSubcase.notifyPropertyChange(prop));
  });
};

/**
 * @description Zet een agendaitem of subcase naar nog niet formeel ok
 * @param subcaseOrAgendaitem De agendaitem of subcae waarvan de formaliteit gereset dient te worden naar nog niet formeel ok
 */
export const setNotYetFormallyOk = (subcaseOrAgendaitem) => {
  if (subcaseOrAgendaitem.get('formallyOk') !== CONFIG.notYetFormallyOk) {
    subcaseOrAgendaitem.set('formallyOk', CONFIG.notYetFormallyOk);
  }
};

/**
 *@name setAgendaitemFormallyOk
 *@description Zet een agendapunt naar formeel Ok.
 * @param agendaitem
 */
export const setAgendaitemFormallyOk = async(agendaitem) => {
  if (agendaitem.get('formallyOk') !== CONFIG.formallyOk) {
    agendaitem.set('formallyOk', CONFIG.formallyOk);
    await agendaitem.save();
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
 * @description Set some properties on a model.
 * @param model Kan van het type agendaitem of subcase zijn
 * @param propertiesToSet de properties die we dienen aan te passen
 * @param resetFormallyOk Dient de formaliteit aangepast te worden of niet (default true)
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
 * @description Zet de modified date property van een agenda op basis van de doorgegeven agendaitem
 * @param agendaitem Het agendaitem om de agenda mee op te vragen.
 * @returns {Promise<void>}
 */
export const setModifiedOnAgendaOfAgendaitem = async(agendaitem) => {
  const agenda = await agendaitem.get('agenda');
  const isDesignAgenda = await agenda.asyncCheckIfDesignAgenda();
  if (agenda && isDesignAgenda) {
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
  const isAgendaitem = item.get('modelName') === 'agendaitem';

  await item.preEditOrSaveCheck();
  if (isAgendaitem) {
    const agenda = await item.get('agenda');
    const isDesignAgenda = await agenda.asyncCheckIfDesignAgenda();

    const agendaActivity = await item.get('agendaActivity');
    if (isDesignAgenda && agendaActivity) {
      const agendaitemSubcase = await agendaActivity.get('subcase');
      await agendaitemSubcase.preEditOrSaveCheck();
      await setNewPropertiesToModel(agendaitemSubcase, propertiesToSetOnSubcase, false);
    }
    await setNewPropertiesToModel(item, propertiesToSetOnAgendaitem, resetFormallyOk);
    await setModifiedOnAgendaOfAgendaitem(item);
  } else {
    await setNewPropertiesToModel(item, propertiesToSetOnSubcase, false);
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
  agendaitems.map(async(agendaitem) => {
    const mandatees = await agendaitem.get('mandatees');
    if (agendaitem.isApproval) {
      return;
    }
    if (mandatees.length === 0) {
      agendaitem.set('groupPriority', 'ZZZZZZZZ');
      return;
    }
    const mandateePriorities = mandatees.map((mandatee) => mandatee.priorityAlpha);
    let calculatedGroupPriority = '';
    mandateePriorities.sort(); // should sort on letters A - Z
    for (let index = 0; index < mandateePriorities.length; index++) {
      calculatedGroupPriority += mandateePriorities[index];
    }
    agendaitem.set('groupPriority', calculatedGroupPriority);
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
    const foundItem = groups.find((group) => group.groupName === groupName);

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
  const draftAgendaitems = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark && !agendaitem.isApproval);

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
  let groupsArray = groupedAgendaitems;
  if (!allowEmptyGroups) {
    groupsArray = groupsArray.filter((group) => group.groupName && group.groupname !== 'Geen toegekende ministers');
  } else {
    groupsArray = groupsArray.filter((group) => group.groupname !== 'Geen toegekende ministers');
  }

  groupsArray = groupsArray.sortBy('groupPriority').map((group) => EmberObject.create(group));

  return groupsArray;
};

/**
 * Given a set of agendaitems, set their priority
 * @name setAgendaitemsPriority
 * @param  {Array<agendaitem>}   agendaitems  Array of agendaitem objects to set priority on.
 * @param  {Boolean} isEditor     When true, the user is allowed to edit the trigger a recalculation of the priority.
 * @param {Boolean} isDesignAgenda  When true, the agenda is a designagenda.
 */
export const setAgendaitemsPriority = async(agendaitems, isEditor, isDesignAgenda) => {
  if (isEditor && isDesignAgenda) {
    return await Promise.all(agendaitems.map(async(agendaitem, index) => {
      agendaitem.set('priority', index + 1);
      return await agendaitem.save();
    }));
  }
};

export const getAgendaitemsFromAgendaThatDontHaveFormallyOkStatus = async(currentAgenda) => {
  const agendaitemsFromCurrentAgenda = await currentAgenda.get('agendaitems').toArray();
  return agendaitemsFromCurrentAgenda.filter((agendaitem) => {
    const formallyOkOption = CONFIG.formallyOkOptions.find((option) => option.label === 'Formeel OK');
    if (formallyOkOption) {
      const formallyOkUri = formallyOkOption.uri;
      if (formallyOkUri !== agendaitem.formallyOk) {
        return agendaitem;
      }
    }
  });
};
