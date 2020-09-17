import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  intl: inject(),
  classNames: ['vl-form__group vl-u-bg-porcelain'],

  isTryingToSave: false,
  isExpanded: false,

  themes: computed('newsletterInfo.themes', {
    get: async function() {
      const newsletterInfo = await this.get('newsletterInfo');
      if (newsletterInfo) {
        return await this.newsletterInfo.get('themes').then((themes) => themes.toArray());
      }

      return [];
    },
    // eslint-disable-next-line no-unused-vars
    set(key, value) {
      return value;
    },
  }),

  hasNota: computed('agendaitem', async function() {
    const nota = await this.agendaitem.get('nota');
    if (nota) {
      return true;
    }
    return false;
  }),

  async saveChanges() {
    this.set('isLoading', true);
    const newsletterInfo = await this.get('newsletterInfo');
    newsletterInfo.set('richtext', this.richtext);
    await newsletterInfo.save().then(async() => {
      this.set('isLoading', false);
    });
    if (this.onSave) {
      this.onSave();
    }
  },

  richtext: computed('editor.htmlContent', function() {
    if (!this.editor) {
      return;
    }
    return this.editor.htmlContent;
  }),

  actions: {
    async trySaveChanges() {
      const themes = await this.get('themes');
      if (themes.length > 0) {
        return this.saveChanges();
      }
      this.toggleProperty('isTryingToSave');
    },

    async cancelEditing() {
      const newsletterInfo = await this.get('newsletterInfo');
      newsletterInfo.rollbackAttributes();
      if (!newsletterInfo.isDeleted) {
        newsletterInfo.hasMany('themes').reload();
      }
      if (this.onCancel) {
        this.onCancel();
      }
    },

    cancelSaveChanges() {
      this.toggleProperty('isTryingToSave');
    },

    async saveChanges() {
      return this.saveChanges();
    },

    async openDocument(agendaitem) {
      const nota = await agendaitem.get('nota');
      if (!nota) {
        return;
      }
      const piece = await nota.get('lastPiece');
      window.open(`/document/${piece.get('id')}`);
    },
    async handleRdfaEditorInit(editorInterface) {
      const newsletterInfo = await this.get('newsletterInfo');
      const newsLetterInfoText = newsletterInfo.get('richtext');
      editorInterface.setHtmlContent(newsLetterInfoText);
      this.set('editor', editorInterface);
    },
    descriptionUpdated(val) {
      this.set('initValue', `${this.get('initValue')} ${val}`);
    },
  },
});
