import { attr, belongsTo } from '@ember-data/model';
import Job from './job';

export default class PublicationMetricsExportJob extends Job {
  @attr('string') metricsType;
  @attr('string') config;

  @belongsTo('file') generated;
  @belongsTo('user') generatedBy;
}
