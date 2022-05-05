// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { isNone } from '@ember/utils';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  intl: inject(),
  classNames: ['auk-box'],

  isTryingToSave: false,
  isExpanded: false,
  isFullscreen: false,

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

  editorInstanceAvailable: computed('editorInstance', function() {
    return this.get('editorInstance') ? true : false; // eslint-disable-line
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
    try {
      // The editor introduces &nbsp; instead of normal spaces to work around
      // certain browsers' behavior where normal spaces on outer ends of text nodes
      // aren't rendered in the content-editable. In recent versions of the editor however,
      // this &nbsp;-inserting seems to happen too often, which results in very long
      // lines that don't break, which is undesired.
      // Here we replace all &nbsp's that don't lean against html tags in an attempt
      // to keep the editor's workaround behavior, while replacing unnecessary &nbsp;'s
      //
      const cleanedHtml = this.richtext.replaceAll(/(?<!>)&nbsp;(?!<)/gm, ' ');
      newsletterInfo.set('richtext', cleanedHtml);
    } catch {
      // pass
    }
    await newsletterInfo.save().then(async() => {
      this.set('isLoading', false);
    });
    if (this.onSave) {
      this.onSave();
    }
  },

  richtext: computed('editorInstance.htmlContent', 'editorInstanceAvailable', function() {
    if (!this.editorInstanceAvailable) {
      throw new Error("Can't get rich text since editor-instance isn't available!");
    }
    return this.editorInstance.htmlContent;
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    async trySaveChanges() {
      const themes = await this.get('themes');
      if (themes.length > 0) {
        return this.saveChanges();
      }
      this.toggleProperty('isTryingToSave');
    },

    fullscreen() {
      this.toggleProperty('isFullscreen');
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
      const nota = await agendaitem.get('notaOrVisienota');
      if (!nota) {
        return;
      }
      const piece = await nota.get('lastPiece');
      window.open(`/document/${piece.get('id')}`);
    },

    async handleRdfaEditorInit(editorInterface) {
      const newsletterInfo = await this.get('newsletterInfo');
      let newsLetterInfoText = newsletterInfo.get('richtext');
      if (isNone(newsLetterInfoText)) {
        // editor stringifies non-string values (to "undefined" for example)
        newsLetterInfoText = '';
      }
      editorInterface.setHtmlContent(newsLetterInfoText);
      this.set('editorInstance', editorInterface);
    },

    descriptionUpdated(val) {
      this.set('initValue', `${this.get('initValue')} ${val}`);
    },
  },
});
