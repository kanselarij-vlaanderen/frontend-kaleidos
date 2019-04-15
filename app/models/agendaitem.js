import DS from 'ember-data';
import { computed } from '@ember/object';

let { Model, attr, belongsTo, hasMany } = DS;
/* 
  propertyToShow is used in the agenda to display the right values based on the agendaName.
**/
export default Model.extend({
  priority: attr('number'),
  created: attr('date'),
  record: attr('string'),
  retracted: attr('boolean'),
  showAsRemark: attr('boolean'),

  titlePress: attr('string'),
  titlePressToShow: computed('isDesignAgenda', function() {
    const { subcase, isDesignAgenda} = this;
    if(isDesignAgenda) {
      return subcase.get('titlePress');
    } else {
      return this.get('titlePress');
    }
  }),

  textPress: attr('string'),
  forPress: attr('boolean'),

  shortTitle: attr('string'),
  shortTitleToShow: computed('isDesignAgenda', 'subcase.shortTitle', 'shortTitle', function() {
    const { isDesignAgenda } = this;
    if(isDesignAgenda) {
      return this.get('subcase.shortTitle');
    } else {
      return this.get('shortTitle');
    }
  }), 

  title: attr('string'),
  titleToShow: computed('isDesignAgenda', 'subcase.title', 'title', function() {
    const { subcase, isDesignAgenda} = this;
    if(isDesignAgenda) {
      return subcase.get('title');
    } else {
      return this.get('title');
    }
  }),

  formallyOk: attr('boolean'),
  formallyOkToShow: computed('isDesignAgenda', 'subcase.formallyOk', 'formallyOk', function() {
    const { isDesignAgenda } = this;
    if(isDesignAgenda) {
      return this.get('subcase.formallyOk');
    } else {
      return this.get('formallyOk');
    }
  }), 

  postponedTo: belongsTo('postponed'),
  agenda: belongsTo('agenda', { inverse: null }),
  decision: belongsTo('decision'),
  subcase: belongsTo('subcase', { inverse: null }),

  confidentiality: belongsTo('confidentiality', { inverse: null }),
  confidentialityToShow: computed('isDesignAgenda', 'subcase.confidentiality', 'confidentiality', function() {
    const { isDesignAgenda } = this;
    if(isDesignAgenda) {
      return this.get('subcase.confidentiality');
    } else {
      return this.get('confidentiality');
    }
  }), 

  newsletterInfo: belongsTo('newsletter-info'),
  meetingRecord: belongsTo('meeting-record'),

  remarks: hasMany('remark'),
  attendees: hasMany('mandatee', { inverse: null }),
  mandatees: hasMany('mandatee', { inverse: null }),
  approvals: hasMany('approval'),
  documentVersions: hasMany('document-version'),

  themes: hasMany('theme'),
  sortedThemes: computed('isDesignAgenda', 'subcase.themes', 'themes', function() {
    const { isDesignAgenda } = this;
    if(isDesignAgenda) {
      return this.get('subcase.themes').sortBy('label');
    } else {
      return this.get('themes').sortBy('label');
    }
  }), 

  governmentDomains: hasMany('government-domain', { inverse: null }),
  governmentDomainsToShow: computed('isDesignAgenda', 'subcase.governmentDomains', 'governmentDomains', function() {
    const { isDesignAgenda } = this;
    if(isDesignAgenda) {
      return this.get('subcase.governmentDomains');
    } else {
      return this.get('governmentDomains');
    }
  }), 

  phases: hasMany('subcase-phase'),
  phasesToShow: computed('isDesignAgenda', 'subcase.phases', 'phases', function() {
    const { isDesignAgenda } = this;
    if(isDesignAgenda) {
      return this.get('subcase.phases');
    } else {
      return this.get('phases');
    }
  }), 

  isPostponed: computed('retracted', 'postponedTo', function () {
    return this.get('postponedTo').then((session) => {
      return session || this.get('retracted');
    });
  }),

  isDesignAgenda: computed('agenda', function () {
    const agendaName = this.get('agenda.name');
    if (agendaName === "Ontwerpagenda") {
      return true;
    } else {
      return false;
    }
  }),

  documents: computed('documentVersions', async function () {
    const documentVersions = await this.get('documentVersions');
    const documents = await Promise.all(documentVersions.map(documentVersion => {
      return documentVersion.get('document');
    }));
    return documents.uniqBy('id');
  }),

  sortedMandatees: computed('mandatees', function () {
    return this.get('mandatees').sortBy('priority');
  })
});
