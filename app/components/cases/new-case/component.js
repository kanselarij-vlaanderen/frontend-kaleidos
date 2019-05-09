import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  title: null,
  shortTitle: null,
  store: inject(),

  actions: {
    async createCase($event) {
      $event.preventDefault();
      const { title, shortTitle, type, selectedPolicyLevel, phase } = this;
      const newDate = new Date();
      let subcaseName = phase.label;
      if(phase.label == "principiële goedkeuring") {
        subcaseName = "1ste principiële goedkeuring"
      }
      let cases = this.store.createRecord('case',
        {
          title: title,
          shortTitle: shortTitle,
          isArchived: false,
          type: type,
          created: newDate,
          policyLevel: selectedPolicyLevel
        });
      cases.save().then((newCase) => {
        const subcase = this.store.createRecord('subcase', {
          case: newCase,
          shortTitle: shortTitle,
          title: title,
          created: newDate,
          phases: [],
          subcaseName: subcaseName,
          formallyOk: false,
          showAsRemark: false,
        });
        subcase.save().then(() => {
          this.close(newCase);
        })
      });
    },

    chooseTheme(theme) {
      this.set('selectedThemes', theme);
    },

    policyLevelChanged(policyLevel) {
      this.set('selectedPolicyLevel', policyLevel);
    },

    typeChanged(type) {
      this.set('type', type);
    },

    phaseChanged(phase) {
      this.set('phase', phase);
    },

    statusChange(status) {
      this.set('status', status);
    },

    close() {
      this.close();
    }
  }
});
