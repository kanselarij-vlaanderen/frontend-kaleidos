import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default class UserMay extends Helper {
  @service currentSession;

  compute([permission]) {
    return this.currentSession.may(permission);
  }
}
