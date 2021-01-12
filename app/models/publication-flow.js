import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';

export default class PublicationFlow extends Model {
  @attr('number') publicationNumber;
  @attr('datetime') translateBefore;
  @attr('datetime') publishBefore;
  @attr('datetime') publishedAt;
  @attr('string') numacNumber; // is this only 1 per flow ?
  @attr('string') remark;
  @attr('datetime') created;
  @attr('datetime') modified;

  @belongsTo('case') case;
  @belongsTo('publication-status', {
    inverse: null,
  }) status;
  @belongsTo('publication-type') type;

  @hasMany('subcase') subcases;
  @hasMany('contact-person') contactPersons;
}
