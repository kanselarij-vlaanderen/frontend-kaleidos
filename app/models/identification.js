import Model, {
  attr, belongsTo
} from '@ember-data/model';

export default class Identification extends Model {
  // Attributes.
  @attr('string') idName;
  @attr('string') agency;

   // Belongs To.
   @belongsTo('structured-identifier') structuredIdentifier;
}

