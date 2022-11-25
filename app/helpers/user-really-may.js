import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default class UserReallyMay extends Helper {
  @service currentSession;

  compute([permission]) {
    return this.currentSession.reallyMay(permission);
  }
}
