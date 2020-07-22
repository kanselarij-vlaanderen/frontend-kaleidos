import DS from 'ember-data';
import { computed } from '@ember/object';

const {
  Model, attr,
} = DS;

export default Model.extend({
  uri: attr('string'),
  label: attr('string'),
  isDesignAgenda: computed('uri', function() {
    return this.uri === 'http://kanselarij.vo.data.gift/id/agendastatus/2735d084-63d1-499f-86f4-9b69eb33727f';
  }),
  isFinal: computed('uri', function() {
    return this.uri === 'http://kanselarij.vo.data.gift/id/agendastatus/f06f2b9f-b3e5-4315-8892-501b00650101';
  }),
  isClosed: computed('uri', function() {
    return this.uri === 'http://kanselarij.vo.data.gift/id/agendastatus/ff0539e6-3e63-450b-a9b7-cc6463a0d3d1';
  }),
});
