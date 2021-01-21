import ModelWithModifier from 'fe-redpencil/models/model-with-modifier';
import {
  attr, belongsTo, hasMany
} from '@ember-data/model';
import { computed } from '@ember/object';

export default class PublicationFlow extends ModelWithModifier {
  @attr('string') publicationNumber;
  @attr('datetime') translateBefore;
  @attr('datetime') publishBefore;
  @attr('datetime') publishedAt;
  @attr('string') numacNumber; // is this only 1 per flow ?
  @attr('string') remark;
  @attr('number') priority;
  @attr('datetime') created;
  @attr('datetime') modified;
  @attr('user') modifiedBy;

  @belongsTo('case') case;
  @belongsTo('publication-status', {
    inverse: null,
  }) status;
  @belongsTo('publication-type') type;

  @hasMany('subcase') subcases;
  @hasMany('contact-person') contactPersons;

  @computed('priority')
  get hasPriority() {
    return this.priority > 0;
  }
}
