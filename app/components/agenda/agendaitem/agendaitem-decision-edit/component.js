import Component from '@ember/component';
import { cached } from 'fe-redpencil/decorators/cached';
import { inject as service } from '@ember/service';
import {computed} from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';

export default Component.extend({
  store: service(),
  classNames: ['vl-form__group vl-u-bg-porcelain'],
  propertiesToSet: Object.freeze(['approved', 'richtext']),
  approved: cached('item.approved'), // TODO in class syntax use as a decorator instead
  initValue: cached('item.richtext'), // TODO in class syntax use as a decorator instead
  documentVersionsSelected: null,
  isEditing: false,
  isExpanded: false,

  async setNewPropertiesToModel(model) {
    const { propertiesToSet } = this;
    await Promise.all(
      propertiesToSet.map(async property => {
        model.set(property, await this.get(property));
      })
    );
    return model.save().then(model => model.reload());
  },

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
  richtext: computed('editor.currentTextContent', function () {
    if (!this.editor) {
      return;
    }
    return this.editor.rootNode.innerHTML.htmlSafe();
  }),

  actions: {
    toggleIsEditing() {
      this.toggleProperty('isEditing');
    },

    async selectDocument(documents) {
      this.set('documentVersionsSelected', documents);
    },

    async cancelEditing() {
      const item = await this.get('item');
      item.rollbackAttributes();
      this.toggleProperty('isEditing');
    },

    async saveChanges() {
      this._super.call(this);
      this.set('isLoading', true);

      const decision = await this.get('item');
      decision.set('modified', moment().utc().toDate());

      await this.setNewPropertiesToModel(decision).catch((e) => {
        this.set('isLoading', false);
        throw(e);
      });

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
    },
    async handleRdfaEditorInit(editorInterface) {
      this.set('editor', editorInterface);
    },

  }
});
