import DS from 'ember-data';
const { Model, attr, belongsTo, hasMany } = DS;
import { computed } from '@ember/object';

export default Model.extend({
  uri: attr('string'),
  label: attr('string'),
  isDesignAgenda: computed('uri', function(){
    return this.uri == "http://kanselarij.vo.data.gift/id/agendastatus/2735d084-63d1-499f-86f4-9b69eb33727f";
  })
});
