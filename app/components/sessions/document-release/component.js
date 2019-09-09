import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Component.extend({
  sessionService: inject(),
  classNameBindings: [":vl-u-spacer-top-s", ":vl-u-spacer-extended-bottom-l"],
  currentSession: alias('sessionService.currentSession'),
  actions: {
    selectDateDocuments(datetime) {
      this.currentSession.set('releaseDocuments', datetime);
      this.currentSession.save();
    },
    selectDateDecisions(datetime) {
      this.currentSession.set('releaseDecisions', datetime);
      this.currentSession.save();
    }
  }
});
