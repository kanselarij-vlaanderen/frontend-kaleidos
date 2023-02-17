import Model, {
  attr, belongsTo
} from '@ember-data/model';
export default class PublicationStatusChange extends Model {
  @attr('datetime') startedAt;
  @belongsTo('publication-flow') publication;
}
