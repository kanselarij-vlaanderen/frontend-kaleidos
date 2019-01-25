import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default Route.extend({
	moment: inject(),
  intl: inject(),

  beforeModel() {
    // this.get('moment').setTimeZone('be');
    this.intl.setLocale('nl-be');
  }
});
