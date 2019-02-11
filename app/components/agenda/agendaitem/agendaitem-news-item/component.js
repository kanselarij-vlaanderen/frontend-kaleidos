import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	classNames:['o-scroll'],
	store: inject(),
	agendaitem:null,
	isEditing:false,

	actions: {
		async addNewsItem(agendaitem){
      let news = this.store.createRecord("news-item", {
        agendaItem: agendaitem
      });
      news.save().then(newAgendaitem => {
				agendaitem.set('news-item',newAgendaitem);
			});
		},

		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		async saveChanges(agendaitem) {
			let newsItem = await agendaitem.get('newsItem');
			newsItem.save().then(() => {
				this.toggleProperty('isEditing');
			})
		}
	}
});
