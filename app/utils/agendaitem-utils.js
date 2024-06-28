import CONSTANTS from 'frontend-kaleidos/config/constants';
import EmberObject from '@ember/object';
import generateReportName from './generate-report-name';
import { equalContentArrays } from './array-helpers';

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
* @param {Array} notas agendaitems with type CONSTANTS.AGENDA_ITEM_TYPES.NOTA
*/
export const getNotaGroups = async (notas) => {
  if (notas?.length > 0) {
    const groups = [];
    const mandatees = await notas.firstObject.mandatees;
    let currentSubmittersArray = mandatees.slice().sort((m1, m2) => m1.priority - m2.priority);
    let currentItemArray = [];
    groups.push(currentItemArray);
    for (let index = 0; index < notas.length; index++) {
      const nota = notas.at(index);
      const mandatees = await nota.mandatees;
      const subm = mandatees.slice().sort((m1, m2) => m1.priority - m2.priority);
      if (equalContentArrays(currentSubmittersArray, subm)) {
        currentItemArray.push(nota);
      } else {
        currentItemArray = [nota];
        groups.push(currentItemArray);
        currentSubmittersArray = subm;
      }
    }
    return groups;
  }
  return [];
}

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
 * @param {Agenda} agenda The agenda the agendaitems belong to
 * @param {Store} store The store service
 * @param {DecisionReportGeneration} decisionReportGeneration The decisionReportGeneration service
 * @param {Boolean} isEditor When true, the user is allowed to edit the trigger a recalculation of the number.
 * @param {AgendaService} agendaService when present, we have to reorder notas via service call to ensure mandatee sorting logic
 */
export const setAgendaitemsNumber = async(agendaitems, agenda, store, decisionReportGeneration, isEditor, agendaService) => {
  const isDesignAgenda = await agenda.status.get('isDesignAgenda');
  if (isEditor && isDesignAgenda) {
    const meeting = await agenda.createdFor;
    let reports = [];
    if (agendaService) {
      await agendaService.reorderAgenda(agenda);
      await Promise.all(agendaitems.map(async(agendaitem) => {
        agendaitem.reload();

        const report = await store.queryOne('report', {
          'filter[:has-no:next-piece]': true,
          'filter[:has:piece-parts]': true,
          'filter[decision-activity][treatment][agendaitems][:id:]': agendaitem.id,
        });
        if (report) {
          const documentContainer = await report.documentContainer;
          const pieces = await documentContainer.pieces;
          const newName = await generateReportName(agendaitem, meeting, pieces.length);
          if (report.name !== newName) {
            reports.push(report);
            report.name = newName;
            await report.belongsTo('file').reload();
            await report.save();
          }
        }
        return;
      }));
    } else {
      await Promise.all(agendaitems.map(async(agendaitem, index) => {
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
    }

    if (reports.length) {
      await decisionReportGeneration.generateReplacementReports.perform(reports);
    }
    // return promises;
  }
};

export const reorderAgendaitemsOnAgenda = async(agenda, store, decisionReportGeneration, isEditor, agendaService) => {
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
  await setAgendaitemsNumber(actualAgendaitems, agenda, store, decisionReportGeneration, isEditor, agendaService);
  await setAgendaitemsNumber(actualAnnouncements, agenda, store, decisionReportGeneration, isEditor);
};

/**
 * Class representing a list of agenda-items related to a certain group of mandatees.
 */
export class AgendaitemGroup {
  sortedMandatees;
  mandateeGroupId;
  agendaitems;
  isBekrachtiging;

  /**
   * Create an AgendaitemGroup.
   * @param {Array} mandatees - The group of mandatees.
   * @param {Agendaitem} firstAgendaItem - A first agenda-item to initialize the list of items with.
   */
  constructor(mandatees, firstAgendaItem, isBekrachtiging) {
    this.sortedMandatees = AgendaitemGroup.sortedMandatees(mandatees);
    this.mandateeGroupId = AgendaitemGroup.generateMandateeGroupId(this.sortedMandatees);
    this.agendaitems = [firstAgendaItem];
    this.isBekrachtiging = isBekrachtiging;
  }

  static sortedMandatees(mandatees) {
    // Copy array by value. Manipulating the by-reference array would trigger changes when mandatees is an array from the store
    const copiedMandatees = mandatees.slice();
    return copiedMandatees.sort((m1, m2) => m1.priority - m2.priority);
  }

  static generateMandateeGroupId(sortedMandatees) {
    // Assumes mandatees to be sorted
    return sortedMandatees.map((m) => m.id).join();
  }

  /**
   * Determine if a given agenda-item belongs in this group (can be used before adding it to this.agendaitems)
   * @param {Agendaitem} agendaitem
   * @param {boolean} isBekrachtiging
   * @return {boolean}
   */
  async itemBelongsToThisGroup(agendaitem, isBekrachtiging) {
    const mandatees = await agendaitem.mandatees;
    const sortedMandatees = AgendaitemGroup.sortedMandatees(mandatees);
    const mandateeGroupId = AgendaitemGroup.generateMandateeGroupId(sortedMandatees);

    // Differentiate "no mandatee" groups from bekrachtiging
    if (this.mandateeGroupId === "" && mandateeGroupId === "") {
      // If either both or none are a bekrachtiging, the agendaitem
      // fits in this group. If one is but the other isn't, it doesn't
      // fit.
      return (this.isBekrachtiging && isBekrachtiging)
        || (!this.isBekrachtiging && !isBekrachtiging);
    }
    return mandateeGroupId === this.mandateeGroupId;
  }
}
