import { belongsTo, hasMany, attr } from '@ember-data/model';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import ModelWithModifier from 'frontend-kaleidos/models/model-with-modifier';

// TODO: octane refactor
export default ModelWithModifier.extend({
  modelName: alias('constructor.modelName'),
  intl: inject(),
  text: attr('string'),
  subtitle: attr('string'),
  title: attr('string'),
  richtext: attr('string'),
  mandateeProposal: attr('string'),
  finished: attr('boolean'),
  inNewsletter: attr('boolean'),
  publicationDate: attr('datetime'),
  publicationDocDate: attr('datetime'),
  remark: attr('string'),

  agendaItemTreatment: hasMany('agenda-item-treatment', {
    serialize: true, // on creation of the newsletter-info, multiple decisions (for now also treatments) might already exist.
  }),
  meeting: belongsTo('meeting', {
    inverse: null,
  }),
  pieces: hasMany('piece', {
    inverse: null,
  }),
  themes: hasMany('themes', {
    inverse: null,
  }),

  // TODO This computed property is used in:
  // - Agenda::Agendaitem::agendaitemNewsItemEdit
  // - Newsletter:NewsletterItem::ItemContent
  // - Agenda::Agendaitem::AgendaitemNewsItem
  // Refactor these usages and remove this computed property
  newsletterProposal: computed('agendaItemTreatment.{[],@each.subcase}', async function() {
    // eslint-disable-next-line ember/no-get
    const treatments = await this.get('agendaItemTreatment');
    const treatment = treatments.firstObject;
    if (treatment) {
      const subcase = await treatment.get('subcase');
      const mandatees = await subcase.get('mandatees');
      const sortedMandatees = await mandatees.sortBy('priority');
      let proposalText = this.intl.t('proposal-text');
      const seperatorComma = ', ';
      const seperatorAnd = ' en ';
      if (sortedMandatees && sortedMandatees.length > 1) {
        for (let index = 0; index < sortedMandatees.length; index++) {
          const mandatee = sortedMandatees.objectAt(index);
          if (index > 0) {
            if (sortedMandatees.length - 1 === index) {
              proposalText = `${proposalText}${seperatorAnd}`;
            } else {
              proposalText = `${proposalText}${seperatorComma}`;
            }
          }
          if (mandatee.newsletterTitle) {
            proposalText = `${proposalText}${mandatee.newsletterTitle}`;
          } else {
            proposalText = `${proposalText}${mandatee.get('title')}`;
          }
        }// end for loop
        return proposalText;
      }
      const requestedBy = await subcase.get('requestedBy');
      if (requestedBy) {
        if (requestedBy.newsletterTitle) {
          proposalText = `${proposalText}${requestedBy.newsletterTitle}`;
        } else {
          proposalText = `${proposalText}${requestedBy.get('title')}`;
        }
        return proposalText;
      }
    }
    return null;
  }),

});
