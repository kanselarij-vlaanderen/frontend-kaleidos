import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default Route.extend({
	moment: inject(),
  intl: inject(),

  beforeModel() {
    this.intl.setLocale('nl-be');
    this.get('moment').setTimeZone('Europe/Brussels');
  }
});
