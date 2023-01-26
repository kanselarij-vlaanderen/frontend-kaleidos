import { attr, belongsTo } from '@ember-data/model';
import Job from './job';

export default class PublicationMetricsExportJob extends Job {
  @attr('json') config;

  @belongsTo('publication-report-type', { inverse: null, async: true })
  reportType;
  @belongsTo('file', { inverse: null, async: true }) generated;
  @belongsTo('user', { inverse: null, async: true }) generatedBy;
}
