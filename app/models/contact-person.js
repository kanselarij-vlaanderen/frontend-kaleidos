import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ContactPerson extends Model {
  @attr('string') email;
  @attr('string') telephone; // TODO: Voorlopig niet in gebuik

  @belongsTo('person', { inverse: 'contactPerson', async: true }) person;
  @hasMany('publication-flow', { inverse: 'contactPersons', async: true })
  publicationFlows;
}
