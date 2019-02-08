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

  actions: {
    async saveItem(){
      this.agendaitem.save();
    },
    async addNewsItem(){
      let news = this.store.createRecord("news-item", {
        agendaItem: this.agendaitem
      });
      news.save();
    },
    async addDecision(){
      let decision = this.store.createRecord("decision", {
        agendaItem: this.agendaitem
      });
      decision.save();
    }
  }
});
