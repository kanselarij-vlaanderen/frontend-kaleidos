import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

const {
  Model, attr, belongsTo,
} = DS;

export default Model.extend({
  intl: inject(),
  agendaitem: belongsTo('agendaitem'),
  subcase: belongsTo('subcase'),
  report: belongsTo('piece'),
  newsletterInfo: belongsTo('newsletter-info'),
  decisionResultCode: belongsTo('decision-result-code', {
    inverse: null,
  }),
  modified: attr('datetime'),
  created: attr('datetime'),
  treatmentApproval: computed('report', function() {
    return this.intl.t('signed-document-decision', {
      name: this.get('report.lastPiece.name'),
    });
  }),
});
