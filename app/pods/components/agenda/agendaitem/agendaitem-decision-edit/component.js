import Component from '@ember/component';
import { cached } from 'fe-redpencil/decorators/cached';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

export default Component.extend({
  store: service(),
  classNames: ['vl-form__group vl-u-bg-porcelain'],
  propertiesToSet: Object.freeze(['approved', 'richtext']),
  approved: cached('decision.approved'), // TODO in class syntax use as a decorator instead
  initValue: cached('decision.richtext'), // TODO in class syntax use as a decorator instead
  documentVersionsSelected: null,
  isEditing: false,
  isExpanded: false,
  decision: null,

  async setNewPropertiesToModel(model) {
    const {
      propertiesToSet,
    } = this;
    await Promise.all(
      propertiesToSet.map(async(property) => {
        model.set(property, await this.get(property));
      })
    );
    return model.save().then((model) => model.reload());
  },

  richtext: computed('editor.currentTextContent', function() {
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
      const decision = await this.get('decision');
      decision.rollbackAttributes();
      this.toggleProperty('isEditing');
    },

    async saveChanges() {
      this._super.call(this);
      this.set('isLoading', true);

      const decision = await this.get('decision');
      decision.set('modified', moment().utc()
        .toDate());

      await this.setNewPropertiesToModel(decision).catch((exception) => {
        this.set('isLoading', false);
        throw (exception);
      });

      let agendaitemToUpdate;
      if (this.isTableRow) {
        await this.subcase.get('decisions').reload();
        agendaitemToUpdate = this.agendaitem;
      } else {
        agendaitemToUpdate = await this.agendaitem;
      }
      await agendaitemToUpdate.save();
      if (!this.get('isDestroyed')) {
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

  },
});
