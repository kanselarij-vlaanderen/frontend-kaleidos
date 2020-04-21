import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import EmberObject from '@ember/object';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { saveChanges as saveMandateeChanges } from 'fe-redpencil/utils/agenda-item-utils';
import DS from 'ember-data';

export default Component.extend(isAuthenticatedMixin, {
  store: inject(),
  classNames: ['vl-u-spacer-extended-bottom-l'],
  item: null,
  propertiesToSet: Object.freeze(['mandatees', 'governmentDomains']),

  mandateeRows: computed('item', 'item.subcase', 'mandatees.@each', function () {
    return DS.PromiseArray.create({
      promise: this.constructMandateeRows().then((rows) => {
        return this.get('item.requestedBy').then((requestedBy) => {
          if (!requestedBy && rows.get('length') > 0) {
            rows.get('firstObject').set('isSubmitter', true);
          } else {
            const foundMandatee = rows.find((row) => row.get('mandatee.id') === requestedBy.get('id'));
            if (foundMandatee) {
              foundMandatee.set('isSubmitter', true);
            }
          }
          return rows.sortBy('mandateePriority');
        });
      })
    })
  }),

  async createMandateeRow(mandatee, iseCodes) {
    const fields = [...new Set(await Promise.all(iseCodes.map((iseCode) => iseCode.get('field'))))];
    const domains = [...new Set(await Promise.all(fields.map((field) => field.get('domain'))))];

    const domainsToShow = domains.map((domain) => domain.get('label')).join(', ');
    const fieldsToShow = fields.map((field) => field.get('label')).join(', ');

    return EmberObject.create(
      {
        fieldsToShow,
        domainsToShow,
        mandatee: mandatee,
        mandateePriority: mandatee.get('priority'),
        domains: domains,
        fields: fields,
        iseCodes: iseCodes,
      })
  },

  async getIseCodesOfMandatee(iseCodes, mandatee) {
    const iseCodesOfMandatee = await mandatee.get('iseCodes');
    return iseCodes.filter((iseCodeOfMandatee) => {
      const foundIseCode = iseCodesOfMandatee.find((iseCode) => iseCode.get('id') === iseCodeOfMandatee.get('id'));

      return !!foundIseCode;
    })
  },

  async constructMandateeRows() {
    const isAgendaItem = this.item.get('modelName') === 'agendaitem';
    let subcase;
    if (isAgendaItem) {
      subcase = await this.get('item.subcase');
    } else {
      subcase = await this.get('item');
    }

    const iseCodes = await subcase.get('iseCodes');
    const mandatees = await (await this.get('item.mandatees')).sortBy('priority');
    let selectedMandatee = await subcase.get('requestedBy');
    const mandateeLength = mandatees.get('length');
    if (mandateeLength === 1) {
      selectedMandatee = mandatees.get('firstObject');
    }
    return Promise.all(mandatees.map(async (mandatee) => {
      const filteredIseCodes = await this.getIseCodesOfMandatee(iseCodes, mandatee);
      const row = await this.createMandateeRow(mandatee, filteredIseCodes);
      if (selectedMandatee && mandatee.get('id') === selectedMandatee.get('id')) {
        row.set('isSubmitter', true);
      } else if (mandateeLength === 0) {
        row.set('isSubmitter', true);
      }
      return row;
    }))
  },

  actions: {
    toggleIsEditing() {
      this.toggleProperty('isEditing');
    },

    async cancelEditing() {
      this.set('mandateeRows', await this.constructMandateeRows());
      this.toggleProperty('isEditing');
    },

    async saveChanges() {
      this.set('isLoading', true);
      if (this.item.get('modelName') === 'agendaitem') {
        const subcase = await this.get('item.subcase');
        if (subcase) {
          //Without this, saving mandatees on agendaitem do not always persist to the subcase
          await subcase.get('mandatees');
        }
      }
      const propertiesToSetOnSubcase = await this.parseDomainsAndMandatees();
      const propertiesToSetOnAgendaitem = { 'mandatees': propertiesToSetOnSubcase['mandatees'] }
      const resetFormallyOk = true;
      try {
        await saveMandateeChanges(this.item, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, resetFormallyOk);
        this.set('isLoading', false);
        this.toggleProperty('isEditing');
      } catch (e) {
        this.set('isLoading', false);
        throw (e);
      }
    },

    addRow() {
      this.toggleProperty('isAdding');
    }
  },

  async parseDomainsAndMandatees() {
    const mandateeRows = await this.get('mandateeRows');
    const mandatees = [];
    let iseCodes = [];
    let requestedBy = null;
    if (mandateeRows && mandateeRows.get('length') > 0) {
      mandateeRows.map(row => {
        if (row.get('isSubmitter')) {
          requestedBy = row.get('mandatee');
        }
        mandatees.push(row.get('mandatee'));
        const rowIseCodes = row.get('iseCodes');
        rowIseCodes.map((code) => {
          iseCodes.push(code);
        })
      })
    }
    return { mandatees, iseCodes, requestedBy };
  },

});
