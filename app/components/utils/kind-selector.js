/* eslint-disable ember/no-arrow-function-computed-properties */
// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import CONFIG from 'frontend-kaleidos/utils/config';
import EmberObject, { computed } from '@ember/object';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  classNames: ['auk-u-mb-2'],
  isLoading: null,
  hideLabel: null,

  options: computed(() => CONFIG.MINISTERRAAD_TYPES.TYPES.map((meetingType) => EmberObject.create(meetingType))),

  selectedkind: computed('options', 'kind', function() {
    return this.options.find((kind) => this.kind && kind.uri === this.kind.uri) || this.options.get('firstObject');
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    setAction(meetingType) {
      this.set('selectedkind', meetingType);
      this.setAction(meetingType.get('uri'));
    },
  },
});
