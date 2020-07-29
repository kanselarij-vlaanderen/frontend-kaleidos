import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  hasNota: computed('row', async function() {
    const nota = await this.row.get('nota');
    if (nota) {
      return true;
    }
    return false;
  }),

  actions: {
    async openDocument(row) {
      const nota = await row.get('nota');
      if (!nota) {
        return;
      }
      const documentVersion = await nota.get('lastDocumentVersion');
      window.open(`/document/${documentVersion.get('id')}`);
    },
  },
});
