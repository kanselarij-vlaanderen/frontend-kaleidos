import Component from '@ember/component';
import DocumentsSelectorMixin from 'fe-redpencil/mixins/documents-selector-mixin';
import RdfaEditorMixin from 'fe-redpencil/mixins/rdfa-editor-mixin';
import { cached } from 'fe-redpencil/decorators/cached';
import { updateModifiedProperty } from 'fe-redpencil/utils/modification-utils';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';

export default Component.extend(DocumentsSelectorMixin, RdfaEditorMixin, {
  classNames: ['vl-form__group vl-u-bg-porcelain'],
  propertiesToSet: Object.freeze(['approved', 'richtext']),
  approved: cached('item.approved'), // TODO in class syntax use as a decorator instead
  initValue: cached('item.richtext'), // TODO in class syntax use as a decorator instead

  async setDecisionPhaseToSubcase() {
    const approved = await this.get('approved');
    const subcase = await this.get('subcase')

    const foundDecidedPhases = await this.store.query('subcase-phase', {
      filter: { code: { id: CONFIG.decidedCodeId }, subcase: { id: subcase.get('id') } }
    });

    if (foundDecidedPhases && foundDecidedPhases.length > 0) {
      await Promise.all(foundDecidedPhases.map((phase) => phase.destroyRecord()));
    }
    if (approved) {
      const decidedCode = await this.store.findRecord('subcase-phase-code', CONFIG.decidedCodeId);
      const newDecisionPhase = this.store.createRecord('subcase-phase', {
        date: moment().utc().toDate(),
        code: decidedCode,
        subcase: subcase
      });
      return newDecisionPhase.save();
    }
  },

  actions: {
    // TODO refactor this, most of this code is dead
    async saveChanges() {
      this._super.call(this);
      this.set('isLoading', true);
      const { isAgendaItem } = this; // always undefined
      // This item is always of type decision
      const item = await this.get('item');
      item.set('modified', moment().utc().toDate());

      if (isAgendaItem && !item.showAsRemark) {
        // dead code because item is decision
        const isDesignAgenda = await item.get('isDesignAgenda');
        if (isDesignAgenda) {
          const agendaitemSubcase = await item.get('subcase');
          await this.setNewPropertiesToModel(agendaitemSubcase).catch((e) => {
            this.set('isLoading', false);
            throw(e);
          });
          agendaitemSubcase.reload();
        }
        await this.setNewPropertiesToModel(item).then(async () => {
          const agenda = await item.get('agenda');
          updateModifiedProperty(agenda);
          item.reload();
        }).catch((e) => {
          this.set('isLoading', false);
          throw(e);
        });
      } else {
        // alive code
        await this.setNewPropertiesToModel(item).catch((e) => {
          this.set('isLoading', false);
          throw(e);
        });
        // dead code because item is decision
        const agendaitemsOnDesignAgendaToEdit = await item.get('agendaitemsOnDesignAgendaToEdit');
        if (agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0) {
          await Promise.all(agendaitemsOnDesignAgendaToEdit.map(async (agendaitem) => {
            await this.setNewPropertiesToModel(agendaitem).then(async () => {
              const agenda = await item.get('agenda');
              updateModifiedProperty(agenda).then((agenda) => {
                agenda.reload();
              });
              await item.reload();
              item.notifyPropertyChanged('decisions');
            }).catch((e) => {
              this.set('isLoading', false);
              throw(e);
            });
          }));
        }
      }
      await this.setDecisionPhaseToSubcase();

      if (!this.get('isDestroyed')) {
        let agendaitemToUpdate;
        if (this.isTableRow) {
          const subcase = await this.agendaitem.get('subcase');
          (await subcase.get('decisions')).reload();
          agendaitemToUpdate = await this.agendaitem.content;
        } else {
          agendaitemToUpdate = await this.agendaitem;
        }
        await agendaitemToUpdate.save();
        this.set('isLoading', false);
        this.toggleProperty('isEditing');
      }
    },

    descriptionUpdated(val) {
      this.set('initValue', this.richtext + val);
    }
  }
});
