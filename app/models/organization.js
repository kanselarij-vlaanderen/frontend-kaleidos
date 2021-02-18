import ModelWithModifier from 'fe-redpencil/models/model-with-modifier';
import {
  attr,
  hasMany
} from '@ember-data/model';

export default class Organization extends ModelWithModifier {
  @attr('string') name;

  // Has many .
  @hasMany('contact-person', {
    inverse: null,
  }) contactPersons;

  // identifier: attr(), // OVO-code not used
  // member: hasMany('user'), not used.
  // abbreviation: attr('string'), not used.
  // subjectPage: alias('uri'), not used.
}
