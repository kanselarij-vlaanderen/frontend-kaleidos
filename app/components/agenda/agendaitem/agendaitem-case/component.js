import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Component.extend({
  classNames: ["vl-u-spacer--large vl-u-spacer-extended-top-l"],
  store: inject('store'),
  sessionService: inject(),
  currentSession: alias('sessionService.currentSession'),
  editable: null,
  agendaitem: null
});
