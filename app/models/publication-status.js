import Model, {
  attr, hasMany
} from '@ember-data/model';
import CONFIG from 'fe-redpencil/utils/config';

export default class PublicationStatus extends Model {
  @attr('string') uri;
  @attr('string') name;
  @attr('number') priority;
  @hasMany('publication-flow') publicaties;

  get isToBePublished() {
    return this.uri === CONFIG.publicationStatusToPublish.uri;
  }
  get isPublished() {
    return this.uri === CONFIG.publicationStatusPublished.uri;
  }
}
