import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	classNames:['o-scroll'],
	store: inject(),
	agendaitem:null,

	actions: {
		async addNewsItem(agendaitem){
      let news = this.store.createRecord("news-item", {
        agendaItem: agendaitem
      });
      news.save().then(newAgendaitem => {
				agendaitem.set('news-item',newAgendaitem);
			});
    },
	}
});
