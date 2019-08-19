import Component from '@ember/component';
import DocumentsSelectorMixin from 'fe-redpencil/mixins/documents-selector-mixin';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import { computed } from '@ember/object';
import RdfaEditorMixin from 'fe-redpencil/mixins/rdfa-editor-mixin';
import { inject } from '@ember/service';

export default Component.extend(DocumentsSelectorMixin, RdfaEditorMixin, {
  intl: inject(),
  classNames: ['vl-form__group vl-u-bg-porcelain'],
  propertiesToSet: [
    'finished',
    'subtitle',
    'title',
    'text',
    'richtext',
    'mandateeProposal',
    'remark',
  ],
  subtitle: getCachedProperty('subtitle'),
  text: getCachedProperty('text'),
  title: getCachedProperty('title'),
  finished: getCachedProperty('finished'),
  remark: getCachedProperty('remark'),

  themes: computed(`agendaitem.themes`, {
    get() {
      const { agendaitem } = this;
      if (agendaitem) return agendaitem.get('themes');
    },
    set: function(key, value) {
      return value;
    },
  }),

  mandateeProposal: computed(`agendaitem.requestedBy.nickName`, 'item.mandateeProposal', {
    get() {
      const { agendaitem, item } = this;

      if (item && agendaitem) {
        const mandateeProposal = item.get('mandateeProposal');
        if (mandateeProposal && mandateeProposal != '') {
          return mandateeProposal;
        }
        return agendaitem.get('requestedBy').then((requestedBy) => {
          if (requestedBy) {
            const proposalText = this.intl.t('proposal-text');
            return `${proposalText}${requestedBy.get('nickName')}`;
          } else {
            return '';
          }
        });
      } else {
        return '';
      }
    },
    set: function(key, value) {
      return value;
    },
  }),

  actions: {
    async saveChanges() {
      this.set('isLoading', true);
      const item = await this.get('item');
      const documentVersionsSelected = this.get('documentVersionsSelected');
      const itemDocumentsToEdit = await item.get('documentVersions');
      const agendaitem = await this.store.findRecord('agendaitem', this.get('agendaitem.id'));
      const themes = await this.themes;
      if (documentVersionsSelected) {
        await Promise.all(
          documentVersionsSelected.map(async (documentVersion) => {
            if (documentVersion.get('selected')) {
              item.get('documentVersions').addObject(documentVersion);
            } else {
              const foundDocument = itemDocumentsToEdit.find(
                (item) => item.get('id') == documentVersion.get('id')
              );
              if (foundDocument) {
                item.get('documentVersions').removeObject(documentVersion);
              }
            }
          })
        );
      }
      this.setNewPropertiesToModel(item).then((newModel) => {
        newModel.reload();
        if (themes) {
          agendaitem.set('themes', themes);
          agendaitem.save().then(() => {
            this.set('isLoading', false);
            this.toggleProperty('isEditing');
          });
        } else {
          this.set('isLoading', false);
          this.toggleProperty('isEditing');
        }
      });
    },
  },
});
