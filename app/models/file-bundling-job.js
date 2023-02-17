import { belongsTo } from '@ember-data/model';
import Job from './job';

export default Job.extend({
  generated: belongsTo('file', {
    inverse: null,
  }),
});
