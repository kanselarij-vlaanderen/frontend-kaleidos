import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';

export default Component.extend({
  title: null,
  shortTitle: null,
  confidential: false,
  store: inject(),

  subcaseType: computed('store', function () {
    return this.store.findRecord('subcase-type', CONFIG.preparationSubcaseTypeId);
  }),

  selectedPolicyLevel: computed('store', function () {
    return this.store.findRecord('policy-level', CONFIG.VRCaseTypeID);
  }),

  getSubcaseName(subcaseType) {
    let subcaseName = subcaseType.get('label');
    if (subcaseType.get('id') === CONFIG.approvalSubcaseTypeId) {
      subcaseName = CONFIG.resultSubcaseName;
    }

    return subcaseName;
  },

  createCase(newDate) {
    const { title, shortTitle, type, selectedPolicyLevel, selectedMeeting, submitter, confidential } = this;
    return this.store.createRecord('case',
      {
        title, shortTitle, submitter, type, confidential,
        isArchived: false,
        created: newDate,
        policyLevel: selectedPolicyLevel,
        relatedMeeting: selectedMeeting
      });
  },

  createSubcase(newCase, newDate) {
    const { title, shortTitle, subcaseType, confidential } = this;
    const subcaseName = this.getSubcaseName(subcaseType);

    return this.store.createRecord('subcase', {
      case: newCase,
      created: newDate,
      modified: newDate,
      shortTitle: shortTitle,
      title: title,
      type: subcaseType,
      subcaseName: subcaseName,
      isArchived: false,
      phases: [],
      formallyOk: false,
      showAsRemark: false,
      confidential: confidential,
    });
  },

  actions: {
    async createCase($event) {
      $event.preventDefault();
      const newDate = new Date();
      const caze = this.createCase(newDate);

      caze.save().then((newCase) => {
        const subcase = this.createSubcase(newCase, newDate);
        subcase.save().then(() => {
          this.close(newCase);
        })
      });
    },

    chooseTheme(theme) {
      this.set('selectedThemes', theme);
    },

    policyLevelChanged(id) {
      const policyLevel = this.store.peekRecord('policy-level', id)
      this.set('selectedPolicyLevel', policyLevel);
    },

    typeChanged(type) {
      this.set('type', type);
    },

    subcaseTypeChanged(subcaseType) {
      this.set('subcaseType', subcaseType);
    },

    statusChange(status) {
      this.set('status', status);
    },

    submitterChanged(submitter) {
      this.set('submitter', submitter);
    },

    selectedMeetingChanged(meeting) {
      this.set('selectedMeeting', meeting);
    },

    close() {
      this.close();
    }
  }
});
