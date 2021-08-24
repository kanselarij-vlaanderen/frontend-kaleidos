// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject } from '@ember/service';
import { not } from '@ember/object/computed';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  classNames: ['auk-content'],
  newsletterService: inject(),
  currentSession: inject(),
  allowEditing: false,
  itemIndex: 0,
  isEditing: false,
  agendaitem: null,
  newsletterInfo: null,
  showIndex: true,

  isFlandersArt: not('allowEditing'),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    startEditing() {
      if (this.onStartEditing) {
        this.onStartEditing();
      }
    },
  },
});
