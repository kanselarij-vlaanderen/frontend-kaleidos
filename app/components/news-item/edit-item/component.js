import Component from '@ember/component';
import { cached } from 'fe-redpencil/decorators/cached';
import {computed} from '@ember/object';
import RdfaEditorMixin from 'fe-redpencil/mixins/rdfa-editor-mixin';
import {inject} from '@ember/service';

export default Component.extend(RdfaEditorMixin, {
  intl: inject(),
  classNames: ['vl-form__group vl-u-bg-porcelain'],
  propertiesToSet: Object.freeze([
    'finished',
    'subtitle',
    'title',
    'text',
    'richtext',
    'mandateeProposal',
    'remark',
  ]),
  documentVersionsSelected: null,
  isEditing: false,

  subtitle: cached('item.subtitle'), // TODO in class syntax use as a decorator instead
  text: cached('item.text'), // TODO in class syntax use as a decorator instead
  title: cached('item.title'), // TODO in class syntax use as a decorator instead
  finished: cached('item.finished'), // TODO in class syntax use as a decorator instead
  remark: cached('item.remark'), // TODO in class syntax use as a decorator instead
  mandateeProposal: cached('item.newsletterProposal'), // TODO in class syntax use as a decorator instead

  isTryingToSave: false,

  themes: computed(`agendaitem.subcase.newsletterInfo.themes`, {
    async get() {
      const {agendaitem} = this;
      if (agendaitem) {
        return await agendaitem.get('subcase.newsletterInfo.themes').then((themes) => {
          return themes.toArray();
        })
      } else {
        return [];
      }
    },
    set: function (key, value) {
      return value;
    },
  }),

  hasNota: computed('agendaitem', async function () {
    const nota = await this.agendaitem.get('nota');
    if (nota) {
      return true;
    } else {
      return false;
    }
  }),

  async saveChanges() {
    this.set('isLoading', true);
    const item = await this.get('item');
    const documentVersionsSelected = this.get('documentVersionsSelected');
    const itemDocumentsToEdit = await item.get('documentVersions');
    item.set('themes', await this.themes);

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
    this.setNewPropertiesToModel(item).then(async () => {
      this.set('isLoading', false);
      this.toggleProperty('isEditing');
    });
  },

  async setNewPropertiesToModel(model) {
    const { propertiesToSet } = this;
    await Promise.all(
      propertiesToSet.map(async property => {
        model.set(property, await this.get(property));
      })
    );
    return model.save().then(model => model.reload());
  },

  actions: {
    async trySaveChanges() {
      const themes = await this.get('themes');
      if (themes.length > 0) {
        return this.saveChanges()
      }
      this.toggleProperty('isTryingToSave');
    },

    async cancelEditing() {
      const item = await this.get('item');
      item.rollbackAttributes();
      this.toggleProperty('isEditing');
    },

    cancelSaveChanges() {
      this.toggleProperty('isTryingToSave');
    },

    async saveChanges() {
      this.toggleProperty('isTryingToSave');

      this.set('isLoading', true);
      const item = await this.get('item');

      const documentVersionsSelected = this.get('documentVersionsSelected');
      const itemDocumentsToEdit = await item.get('documentVersions');

      if (documentVersionsSelected) {
        await Promise.all(
          documentVersionsSelected.map(async documentVersion => {
            if (documentVersion.get('selected')) {
              item.get('documentVersions').addObject(documentVersion);
            } else {
              const foundDocument = itemDocumentsToEdit.find(
                item => item.get('id') == documentVersion.get('id')
              );
              if (foundDocument) {
                item.get('documentVersions').removeObject(documentVersion);
              }
            }
          })
        );
      }

      this.setNewPropertiesToModel(item).then(newModel => {
        newModel.reload();
        this.set('isLoading', false);
        this.toggleProperty('isEditing');
      });
    },

    async openDocument(agendaitem) {
      const nota = await agendaitem.get('nota');
      if (!nota) {
        return;
      }
      const documentVersion = await nota.get('lastDocumentVersion');
      window.open(`/document/${documentVersion.get('id')}`);
    }
  },
});
