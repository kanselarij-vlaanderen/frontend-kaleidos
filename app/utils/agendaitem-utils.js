import CONSTANTS from 'frontend-kaleidos/config/constants';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import generateReportName from './generate-report-name';

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
    const mandateePriorities = mandatees.map((mandatee) => mandatee.priority);
    // there can be max 11 mandatees, a normal sort() would yield [1,11,3]
    mandateePriorities.sort((a, b) => (a - b));
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

  groupsArray = groupsArray
    .sort((g1, g2) => g1.groupNumber.localeCompare(g2.groupNumber))
    .map((group) => EmberObject.create(group));

  return groupsArray;
};

/**
 * Given a set of agendaitems, set their number
 * @name setAgendaitemsNumber
 * @param  {Array<Agendaitem>} agendaitems  Array of agendaitem objects to set number on.
 * @param {Meeting} meeting The meeting the agendaitems belong to
 * @param {Store} store The store service
 * @param {DecisionReportGeneration} decisionReportGeneration The decisionReportGeneration service
 * @param {Boolean} isEditor When true, the user is allowed to edit the trigger a recalculation of the number.
 * @param {Boolean} isDesignAgenda When true, the agenda is a designagenda.
 */
export const setAgendaitemsNumber = async(agendaitems, meeting, store, decisionReportGeneration, isEditor, isDesignAgenda) => {
  if (isEditor && isDesignAgenda) {
    const reports = [];
    const promises = await Promise.all(agendaitems.map(async(agendaitem, index) => {
      if (agendaitem.number !== index + 1) {
        agendaitem.number = index + 1;
        const agendaitemSave = await agendaitem.save();

        const report = await store.queryOne('report', {
          'filter[:has-no:next-piece]': true,
          'filter[:has:piece-parts]': true,
          'filter[decision-activity][treatment][agendaitems][:id:]': agendaitem.id,
        });
        if (report) {
          reports.push(report);
          const documentContainer = await report.documentContainer;
          const pieces = await documentContainer.pieces;
          report.name = await generateReportName(agendaitem, meeting, pieces.length);
          await report.belongsTo('file').reload();
          await report.save();
        }
        return agendaitemSave;
      }
    }));
    if (reports.length) {
      await decisionReportGeneration.generateReplacementReports.perform(reports);
    }
    return promises;
  }
};

export const reorderAgendaitemsOnAgenda = async(agenda, store, decisionReportGeneration, isEditor) => {
  await agenda.hasMany('agendaitems').reload();
  const agendaitems = await agenda.get('agendaitems');
  const actualAgendaitems = [];
  const actualAnnouncements = [];
  const sortedAgendaitems = agendaitems.slice().sort((a1, a2) => a1.number - a2.number)
  for (const agendaitem of sortedAgendaitems) {
    if (!agendaitem.isDeleted) {
      const type = await agendaitem.type;
      if (type.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA) {
        actualAgendaitems.push(agendaitem);
      } else {
        actualAnnouncements.push(agendaitem);
      }
    }
  }
  const meeting = await agenda.createdFor;
  await setAgendaitemsNumber(actualAgendaitems, meeting, store, decisionReportGeneration, isEditor, true);
  await setAgendaitemsNumber(actualAnnouncements, meeting, store, decisionReportGeneration, isEditor, true);
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
    const copiedMandatees = A(mandatees.slice());
    return copiedMandatees.sort((m1, m2) => m1.priority - m2.priority);
  }

  static generateMandateeGroupId(sortedMandatees) {
    // Assumes mandatees to be sorted
    return sortedMandatees.map((m) => m.id).join();
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
