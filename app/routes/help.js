import Route from '@ember/routing/route';
import { later } from '@ember/runloop';

export default Route.extend({
	redirect(){
		later(() => {
			window.location.replace('https://overheid.vlaanderen.be/kaleidos')
		},1000)
	}
});
