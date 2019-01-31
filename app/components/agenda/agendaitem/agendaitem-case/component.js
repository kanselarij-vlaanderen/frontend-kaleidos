import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  classNameBindings: [":cases--decree-body"],
  store: inject('store'),
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
