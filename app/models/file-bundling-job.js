import DS from 'ember-data';
import Job from './job';

export default Job.extend({
  generated: DS.belongsTo('file', { inverse: null }),
});
