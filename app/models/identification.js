import Model, { attr, belongsTo } from '@ember-data/model';

export default class Identification extends Model {
  @attr('string') idName;
  @attr('string') agency;

  @belongsTo('publication-flow', {
    inverse: 'identification',
    async: true,
  })
  publicationFlow;
  @belongsTo('publication-flow', {
    inverse: 'numacNumbers',
    async: true,
  })
  publicationFlowForNumac;
  @belongsTo('publication-flow', {
    inverse: 'threadId',
    async: true,
  })
  publicationFlowForThreadId;
  @belongsTo('structured-identifier', {
    inverse: 'identification',
    async: true,
  })
  structuredIdentifier;
}
