import CONSTANTS from 'frontend-kaleidos/config/constants';
import EmberObject from '@ember/object';
import { A } from '@ember/array';

/**
 * @description Zet een agendaitem of subcase naar nog niet formeel ok
 * @param subcaseOrAgendaitem De agendaitem of subcae waarvan de formaliteit gereset dient te worden naar nog niet formeel ok
 */
export const setNotYetFormallyOk = (subcaseOrAgendaitem) => {
  if (subcaseOrAgendaitem.get('formallyOk') !== CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK) {
    subcaseOrAgendaitem.set('formallyOk', CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK);
  }
};

/**
 * For a given set of agenda items, will re-order them by their groupNumber
 * ⚠️ Word of caution, this mutates the original set!
 * @param {Array} agendaitems   Agenda items to mutate
 */
export const setCalculatedGroupNumbers = (agendaitems) => Promise.all(
  agendaitems.map(async(agendaitem) => {
    const mandatees = await agendaitem.get('mandatees');
    if (agendaitem.isApproval) {
      return;
    }
    if (mandatees.length === 0) {
      agendaitem.set('groupNumber', 'ZZZZZZZZ');
      return;
    }
    const mandateePriorities = mandatees.map((mandatee) => mandatee.priorityAlpha);
    mandateePriorities.sort(); // should sort on letters A - Z
    agendaitem.set('groupNumber', mandateePriorities.join());
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
        groupNumber: agendaitem.groupNumber,
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
 * For a set of agendaitems, will fetch the drafts, and will group them by number
 * @param  {Array}  agendaitems   Agenda items to parse from
 * @return {Object}               An object containing drafts and groups
 */
export const parseDraftsAndGroupsFromAgendaitems = async(agendaitems) => {
  // Drafts are items without an approval or remark
  const draftAgendaitems = [];
  for (const agendaitem of agendaitems.toArray()) {
    const type = await agendaitem.type;
    if (type.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA && !agendaitem.isApproval) {
      draftAgendaitems.push(agendaitem);
    }
  }

  // Calculate the priorities on the drafts
  await setCalculatedGroupNumbers(draftAgendaitems);

  const groupedAgendaitems = Object.values(groupAgendaitemsByGroupname(draftAgendaitems));
  return {
    draftAgendaitems,
    groupedAgendaitems,
  };
};

/**
 * Given a set of grouped agendaitems, sort them by number
 * @param  {Array}   groupedAgendaitems   A set containing all agendaitems grouped (see above functions)
 * @param  {Boolean} allowEmptyGroups     When true, empty groups are allowed
 * @return {Array}                        The input set, sorted by number ASC
 */
export const sortByNumber = (groupedAgendaitems, allowEmptyGroups) => {
  let groupsArray = groupedAgendaitems;
  if (!allowEmptyGroups) {
    groupsArray = groupsArray.filter((group) => group.groupName && group.groupname !== 'Geen toegekende ministers');
  } else {
    groupsArray = groupsArray.filter((group) => group.groupname !== 'Geen toegekende ministers');
  }

  groupsArray = groupsArray.sortBy('groupNumber').map((group) => EmberObject.create(group));

  return groupsArray;
};

/**
 * Given a set of agendaitems, set their number
 * @name setAgendaitemsNumber
 * @param  {Array<agendaitem>}   agendaitems  Array of agendaitem objects to set number on.
 * @param  {Boolean} isEditor     When true, the user is allowed to edit the trigger a recalculation of the number.
 * @param {Boolean} isDesignAgenda  When true, the agenda is a designagenda.
 */
export const setAgendaitemsNumber = async(agendaitems, isEditor, isDesignAgenda) => {
  if (isEditor && isDesignAgenda) {
    return await Promise.all(agendaitems.map(async(agendaitem, index) => {
      if (agendaitem.number !== index + 1) {
        agendaitem.set('number', index + 1);
        return agendaitem.save();
      }
    }));
  }
};

export const reorderAgendaitemsOnAgenda = async(agenda, isEditor) => {
  await agenda.hasMany('agendaitems').reload();
  const agendaitems = await agenda.get('agendaitems');
  const actualAgendaitems = [];
  const actualAnnouncements = [];
  for (const agendaitem of agendaitems.sortBy('number').toArray()) {
    if (!agendaitem.isDeleted) {
      const type = await agendaitem.type;
      if (type.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA) {
        actualAgendaitems.push(agendaitem);
      } else {
        actualAnnouncements.push(agendaitem);
      }
    }
  }
  await setAgendaitemsNumber(actualAgendaitems, isEditor, true);
  await setAgendaitemsNumber(actualAnnouncements, isEditor, true);
};

/**
 * Class representing a list of agenda-items related to a certain group of mandatees.
 */
export class AgendaitemGroup {
  sortedMandatees;
  mandateeGroupId;
  agendaitems;

  /**
   * Create an AgendaitemGroup.
   * @param {EmberArray} mandatees - The group of mandatees.
   * @param {Agendaitem} firstAgendaItem - A first agenda-item to initialize the list of items with.
   */
  constructor(mandatees, firstAgendaItem) {
    this.sortedMandatees = AgendaitemGroup.sortedMandatees(mandatees);
    this.mandateeGroupId = AgendaitemGroup.generateMandateeGroupId(this.sortedMandatees);
    this.agendaitems = A([firstAgendaItem]);
  }

  static sortedMandatees(mandatees) {
    // Copy array by value. Manipulating the by-reference array would trigger changes when mandatees is an array from the store
    const copiedMandatees = A(mandatees.toArray());
    return copiedMandatees.sortBy('priority');
  }

  static generateMandateeGroupId(sortedMandatees) {
    // Assumes mandatees to be sorted
    return sortedMandatees.mapBy('id').join();
  }

  /**
   * Determine if a given agenda-item belongs in this group (can be used before adding it to this.agendaitems)
   * @param {Agendaitem} agendaitem
   * @return {boolean}
   */
  async itemBelongsToThisGroup(agendaitem) {
    const mandatees = await agendaitem.mandatees;
    const sortedMandatees = AgendaitemGroup.sortedMandatees(mandatees);
    const mandateeGroupId = AgendaitemGroup.generateMandateeGroupId(sortedMandatees);
    return mandateeGroupId === this.mandateeGroupId;
  }
}
