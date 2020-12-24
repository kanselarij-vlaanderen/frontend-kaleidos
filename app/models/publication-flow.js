import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';
import { inject as service } from '@ember/service';

export default class PublicationFlow extends Model {
  // Services.
  @service publicationService;

  // Attributes.
  @attr('string') publicationNumber;
  @attr('datetime') translateBefore;
  @attr('datetime') publishBefore;
  @attr('datetime') publishedAt;
  @attr('string') numacNumber; // is this only 1 per flow ?
  @attr('string') remark;
  @attr('datetime') created;
  @attr('datetime') modified;

  // Belongs To.
  @belongsTo('case') case;
  @belongsTo('publication-status', {
    inverse: null,
  }) status;
  @belongsTo('publication-type') type;

  // Has many .
  @hasMany('subcase') subcases;
  @hasMany('contact-person') contactPersons;
}
