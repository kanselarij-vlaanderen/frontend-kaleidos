/* eslint-disable ember/no-arrow-function-computed-properties */
import Component from '@ember/component';
import CONFIG from 'frontend-kaleidos/utils/config';
import EmberObject, { computed } from '@ember/object';

export default Component.extend({
  classNames: ['auk-u-mb-2'],
  isLoading: null,
  hideLabel: null,

  options: computed(() => CONFIG.kinds.map((meetingType) => EmberObject.create(meetingType))),

  selectedkind: computed('options', 'kind', function() {
    return this.options.find((kind) => this.kind && kind.uri === this.kind.uri) || this.options.get('firstObject');
  }),

  actions: {
    setAction(meetingType) {
      this.set('selectedkind', meetingType);
      this.setAction(meetingType.get('uri'));
    },
  },
});
