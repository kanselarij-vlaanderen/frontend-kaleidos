import Component from '@ember/component';
import { inject } from '@ember/service';
import EmberObject from '@ember/object';

export default Component.extend({
  store: inject(),
  classNames: ['vlc-input-field-block'],
  isAdding: false,
  isEditingMandateeRow: false,

  getDomainOfField(field) {
    if (field) {
      return field.get('domain');
    }
  },

  getFieldOfIseCode(iseCode) {
    if (iseCode) {
      return iseCode.get('field');
    }
  },

  checkMandateeRowsForSubmitter(mandateeRows) {
    const submitters = mandateeRows.filter((item) => item.get('isSubmitter'));
    return submitters.get('length') > 0;
  },

  actions: {
    async saveChanges(mandatee, newRow) {
      const iseCodes = (await mandatee.get('iseCodes')).filter((item) => item);
      const fields = (await Promise.all(iseCodes.map((iseCode) => iseCode.get('field')))).filter((item) => item);
      const domains = await Promise.all(fields.map((field) => field.get('domain')));

      const rowToShow = EmberObject.create({
        domains: [...new Set(domains)],
        fields: [...new Set(fields)],
      });

      const mandateeRows = await this.get('mandateeRows');
      const domainsToShow = newRow.domains.map((domain) => domain.get('label')).join(', ');
      const fieldsToShow = newRow.fields.map((field) => field.get('label')).join(', ');
      const rowToEdit = mandateeRows.find((row) => row.mandatee.id === mandatee.id);
      if (rowToShow && rowToEdit) {
        rowToEdit.set('domains', newRow.domains);
        rowToEdit.set('fields', newRow.fields);
        rowToEdit.set('iseCodes', newRow.iseCodes);
        rowToEdit.set('fieldsToShow', fieldsToShow);
        rowToEdit.set('domainsToShow', domainsToShow);
        this.set('isEditingMandateeRow', false);
        this.set('rowToShow', null);
      } else {
        if (this.checkMandateeRowsForSubmitter(mandateeRows)) {
          newRow.set('isSubmitter', false);
        }
        mandateeRows.addObject(EmberObject.create(
          {
            fieldsToShow,
            domainsToShow,
            ...newRow,
          }
        ));
        this.set('mandateeRows', mandateeRows.sortBy('mandateePriority'));
      }
    },

    cancel() {
      this.set('isAdding', false);
      this.set('isEditingMandateeRow', false);
    },

    async deleteRow(mandateeRow) {
      const mandateeRows = await this.get('mandateeRows');
      mandateeRows.removeObject(mandateeRow);
    },

    async editRow(mandateeRow) {
      this.set('selectedMandateeRow', await mandateeRow);
      const {
        mandatee,
      } = mandateeRow;
      this.set('isLoading', true);
      const totalIseCodes = await mandatee.get('iseCodes');
      const totalFields = [];
      const totalDomains = [];

      await Promise.all(totalIseCodes.map(async(iseCode) => {
        const field = await this.getFieldOfIseCode(iseCode);
        const domain = await this.getDomainOfField(field);
        const {
          iseCodes,
        } = mandateeRow;
        const findSelectedIseCode = iseCodes.find((codeToCheck) => codeToCheck.get('id') === iseCode.get('id'));
        if (findSelectedIseCode) {
          field.set('selected', true);
          domain.set('selected', true);
        }
        totalDomains.push(domain);
        totalFields.push(field);
        return iseCode;
      }));

      const rowToShow = EmberObject.create({
        mandatee,
        domains: [...new Set(totalDomains.filter((item) => item))],
        fields: [...new Set(totalFields.filter((item) => item))],
      });
      this.set('isLoading', false);
      this.set('rowToShow', rowToShow);
      this.set('isEditingMandateeRow', true);
    },

    async valueChanged(mandateeRow) {
      const mandateeRows = await this.mandateeRows;
      const newRows = mandateeRows.map((item) => {
        if (item === mandateeRow) {
          item.set('isSubmitter', true);
        } else {
          item.set('isSubmitter', false);
        }
        return item;
      });
      this.set('mandateeRows', newRows);
    },
  },
});
