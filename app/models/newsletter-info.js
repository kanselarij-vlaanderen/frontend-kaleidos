import DS from 'ember-data';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  modelName: alias('constructor.modelName'),
  intl: inject(),
  text: attr('string'),
  subtitle: attr('string'),
  title: attr('string'),
  richtext: attr('string'),
  mandateeProposal: attr('string'),
  finished: attr('boolean'),
  inNewsletter: attr('boolean'),
  publicationDate: attr('date'),
  publicationDocDate: attr('date'),
  remark: attr('string'),
  subcase: belongsTo('subcase'),

  meeting: belongsTo('meeting', { inverse: null }),
  documentVersions: hasMany('document-version', { inverse: null }),

  displayRemark: computed('remark', 'intl', function() {
    const remark = this.get('remark');
    if (remark && remark != '') {
      return `${this.intl.t('remark')}: ${this.get('remark')}`;
    } else {
      return '';
    }
  }),

  newsletterProposal: computed('mandateeProposal', async function () {
    const subcase =  await this.get('subcase');
    const mandatees = await subcase.get('mandatees');
    const sortedMandatees = await mandatees.sortBy('priority');
    let proposalText = this.intl.t('proposal-text');
    const seperatorComma = ', ';
    const seperatorAnd = ' en ';
    if(sortedMandatees && sortedMandatees.length > 1) {
      for (var i = 0; i < sortedMandatees.length; i++) {
        let mandatee = sortedMandatees.objectAt(i);
        const nickName = await mandatee.get('nickName');
        if(i > 0) {
          if (sortedMandatees.length -1 == i){
            proposalText = `${proposalText}${seperatorAnd}`;
          }else {
            proposalText = `${proposalText}${seperatorComma}`;
          }
        }
        if (nickName) {
          proposalText = `${proposalText}${nickName}`;
        } else {
          proposalText = `${proposalText}${mandatee.get('title')}`;
        }
      }// end for loop
      return proposalText;
    } else {
      const requestedBy = await subcase.get('requestedBy');
      if (requestedBy) {
        const nickName = await requestedBy.get('nickName');
        if (nickName) {
          proposalText = `${proposalText}${nickName}`;
        } else {
          proposalText = `${proposalText}${requestedBy.get('title')}`;
        }
        return proposalText;
      } 
      else {
        return null;
      }
    }
  }),

});
