import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class UserMay extends Helper {
  @service currentSession;

  compute([permission], {checkImpersonator=false}) {
    return this.currentSession.may(permission, checkImpersonator);
  }
}
