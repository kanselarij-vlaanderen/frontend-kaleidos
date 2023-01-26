import Model, { attr, belongsTo } from '@ember-data/model';

export default class ContactPerson extends Model {
  @attr('string') email;
  @attr('string') telephone; // TODO: Voorlopig niet in gebuik

  @belongsTo('person', { inverse: 'contactPerson', async: true }) person;
  @belongsTo('publication-flow', { inverse: 'contactPersons', async: true })
  publicationFlow;
}
