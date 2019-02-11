import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Component.extend({
  classNames: ["u-spacer-top-l"],
  store: inject('store'),
  sessionService: inject(),
  currentSession: alias('sessionService.currentSession'),
  editable: null,
  agendaitem: null,
});
