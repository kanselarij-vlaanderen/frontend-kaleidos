import Job from './job';
import { belongsTo } from '@ember-data/model';

export default class FileBundlingJob extends Job {
  @belongsTo('file', { inverse: null, async: true }) generated;
}
