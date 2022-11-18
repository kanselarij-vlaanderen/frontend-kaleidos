// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { computed } from '@ember/object';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  hasNota: computed('row', async function() {
    const nota = await this.row.get('nota');
    if (nota) {
      return true;
    }
    return false;
  }),

  latestMeetingId: computed('row', async function() {
    const agenda = await this.row.get('agenda');
    const meeting = await agenda.get('createdFor');
    return meeting.id;
  }),

  latestAgendaId: computed('row', async function() {
    const agenda = await this.row.get('agenda');
    return agenda.id;
  }),

  latestAgendaitemId: computed('row', async function() {
    return await this.row.get('id');
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    async openDocument(row) {
      const nota = await row.get('nota');
      if (!nota) {
        return;
      }
      const pieces = await nota.get('pieces');
      const lastPiece = pieces.sortBy('created').lastObject;
      window.open(`/document/${lastPiece.get('id')}`);
    },
  },
});
