import ModelWithModifier from 'frontend-kaleidos/models/model-with-modifier';
import {
  attr,
  hasMany
} from '@ember-data/model';

export default class Organization extends ModelWithModifier {
  @attr('string') name;
  @attr('datetime') created;

  // Has many .
  @hasMany('contact-person', {
    inverse: null,
  }) contactPersons;

  // identifier: attr(), // OVO-code not used
  // member: hasMany('user'), not used.
  // abbreviation: attr('string'), not used.
  // subjectPage: alias('uri'), not used.
}
