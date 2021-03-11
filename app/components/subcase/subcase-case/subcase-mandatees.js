/* eslint-disable class-methods-use-this */
import Component from '@ember/component';
import EmberObject, {
  action, computed
} from '@ember/object';
import { inject as service } from '@ember/service';

import { saveChanges as saveMandateeChanges } from 'frontend-kaleidos/utils/agendaitem-utils';
import DS from 'ember-data';

// TODO code cuplication with agendaitem-case/agendaitem-mandatees
export default class SubcaseMandatees extends Component {
  @service store;

  @service currentSession;

  classNames = ['auk-u-mb-8'];

  subcase = null;

  propertiesToSet = Object.freeze(['mandatees', 'governmentDomains']);

  @computed('subcase', 'mandatees.@each')
  get mandateeRows() {
    return DS.PromiseArray.create({
      promise: this.constructMandateeRows().then((rows) => this.get('subcase.requestedBy').then((requestedBy) => {
        if (!requestedBy && rows.get('length') > 0) {
          rows.get('firstObject').set('isSubmitter', true);
        } else {
          const foundMandatee = rows.find((row) => row.get('mandatee.id') === requestedBy.get('id'));
          if (foundMandatee) {
            foundMandatee.set('isSubmitter', true);
          }
        }
        return rows.sortBy('mandateePriority');
      })),
    });
  }

  async createMandateeRow(mandatee, iseCodes) {
    const fields = [...new Set(await Promise.all(iseCodes.map((iseCode) => iseCode.get('field'))))];
    const domains = [...new Set(await Promise.all(fields.map((field) => field.get('domain'))))];

    const domainsToShow = domains.map((domain) => domain.get('label')).join(', ');
    const fieldsToShow = fields.map((field) => field.get('label')).join(', ');

    return EmberObject.create({
      fieldsToShow,
      domainsToShow,
      mandatee,
      mandateePriority: mandatee.get('priority'),
      domains,
      fields,
      iseCodes,
    });
  }

  async getIseCodesOfMandatee(iseCodes, mandatee) {
    const iseCodesOfMandatee = await mandatee.get('iseCodes');
    return iseCodes.filter((iseCodeOfMandatee) => {
      const foundIseCode = iseCodesOfMandatee.find((iseCode) => iseCode.get('id') === iseCodeOfMandatee.get('id'));

      return !!foundIseCode;
    });
  }

  async constructMandateeRows() {
    const subcase = await this.subcase;
    const iseCodes = await subcase.get('iseCodes');
    const mandatees = await (await subcase.get('mandatees')).sortBy('priority');
    let selectedMandatee = await subcase.get('requestedBy');
    const mandateeLength = mandatees.get('length');
    if (mandateeLength === 1) {
      selectedMandatee = mandatees.get('firstObject');
    }
    return Promise.all(mandatees.map(async(mandatee) => {
      const filteredIseCodes = await this.getIseCodesOfMandatee(iseCodes, mandatee);
      const row = await this.createMandateeRow(mandatee, filteredIseCodes);
      if (selectedMandatee && mandatee.get('id') === selectedMandatee.get('id')) {
        row.set('isSubmitter', true);
      } else if (mandateeLength === 0) {
        row.set('isSubmitter', true);
      }
      return row;
    }));
  }

  async parseDomainsAndMandatees() {
    const mandateeRows = await this.get('mandateeRows');
    const mandatees = [];
    const iseCodes = [];
    let requestedBy = null;
    if (mandateeRows && mandateeRows.get('length') > 0) {
      mandateeRows.map(async(row) => {
        if (row.get('isSubmitter')) {
          requestedBy = row.get('mandatee');
        }
        mandatees.push(row.get('mandatee'));
        const rowIseCodes = await row.get('iseCodes');
        rowIseCodes.map((code) => {
          iseCodes.push(code);
        });
      });
    }
    return {
      mandatees, iseCodes, requestedBy,
    };
  }

  @action
  toggleIsEditing() {
    this.toggleProperty('isEditing');
  }

  @action
  async cancelEditing() {
    this.notifyPropertyChange('mandateeRows');
    this.toggleProperty('isEditing');
  }

  @action
  async saveChanges() {
    this.set('isLoading', true);
    const propertiesToSetOnSubcase = await this.parseDomainsAndMandatees();
    const propertiesToSetOnAgendaitem = {
      mandatees: propertiesToSetOnSubcase.mandatees,
    };
    const resetFormallyOk = true;
    try {
      await saveMandateeChanges(this.subcase, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, resetFormallyOk);
      this.set('isLoading', false);
      this.toggleProperty('isEditing');
    } catch (exception) {
      this.set('isLoading', false);
      throw (exception);
    }
  }

  @action
  addRow() {
    this.toggleProperty('isAdding');
  }
}
