import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  intl: inject(),
  startDate: attr('date'),
  agendaitem: belongsTo('agendaitem'),
  subcase: belongsTo('subcase'),
  report: belongsTo('piece'),
  newsletterInfo: belongsTo('newsletter-info'),
  decisionResultCode: belongsTo('decision-result-code', {
    inverse: null,
  }),
  modified: attr('datetime'),
  created: attr('datetime'),
  treatmentApproval: computed('report.lastPiece.name', function() {
    return this.intl.t('signed-document-decision', {
      // eslint-disable-next-line ember/no-get
      name: this.get('report.lastPiece.name'),
    });
  }),
  publicationFlows: hasMany('publication-flows'),
});
