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

  filterAgendaitems: async function(items, params){
    if(params.definite !== "true"){
      return items;
    }
    let newsLetterByIndex = await Promise.all(items.map((item)=>{
      return item.get('subcase').then((subcase) => {
        return subcase.get('newsletterInfo').then((newsletter) => {
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
