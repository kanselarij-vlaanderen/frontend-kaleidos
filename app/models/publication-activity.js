import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';
import { isEmpty } from '@ember/utils';

export default class PublicationActivity extends Model {
  // Attributes.
  @attr('string') title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  // Relations.
  @belongsTo('publication-subcase') subcase;
  @belongsTo('request-activity') requestActivity;

  @hasMany('piece', {
    inverse: 'publicationActivitiesUsedBy',
  }) usedPieces;
  @hasMany('decision') decisions;

  get isFinished(){
    return !isEmpty(this.endDate);
  }
}
