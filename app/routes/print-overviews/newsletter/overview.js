import Route from '@ember/routing/route';
import SortedAgendaItemsRouteMixin from 'fe-redpencil/mixins/sorted-agenda-items-route-mixin';

export default Route.extend(SortedAgendaItemsRouteMixin, {
	type: 'newsletter',
	include: 'newsletter-info',

	queryParams: {
		definite: { refreshModel: true }
	},

  filterAnnouncements: function(announcements){
    return announcements.filter((item) => {
      return item.showInNewsletter;
    });
  },

  allowEmptyGroups: true,

  filterAgendaitems: async function(items, params){
    if(params.definite !== "true"){
      return items;
    }
    let newsLetterByIndex = await Promise.all(items.map((item)=> {
      if(!item) return;
      return item.get('subcase').then((subcase) => {
        if(!subcase) return;
        return subcase.get('newsletterInfo').then((newsletter) => {
          if(!newsletter) {
            return;
          }
          return newsletter.inNewsletter;
        });
      });
    }));
    let filtered = [];
    items.map((item, index) => {
      if(newsLetterByIndex[index]){
        filtered.push(item);
      }
    });
    return filtered;
  }
});
