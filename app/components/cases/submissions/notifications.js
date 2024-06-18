import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { addObject, removeObject } from 'frontend-kaleidos/utils/array-helpers';

export default class CasesSubmissionsNotificationsComponent extends Component {

  @tracked showNotifiersModal = false;
  @tracked showCCModal = false;

  @action
  saveNotificationAddress(address) {
    const copy = this.args.notificationAddresses?.slice() ?? [];
    addObject(copy, address);
    this.args.onChangeNotificationAddresses?.(copy);
    this.showNotifiersModal = false;
  }

  @action
  removeNotificationAddress(address) {
    const copy = this.args.notificationAddresses?.slice() ?? [];
    removeObject(copy, address);
    this.args.onChangeNotificationAddresses?.(copy);
  }

  @action
  saveCCAddress(address) {
    const copy = this.args.ccAddresses?.slice() ?? [];
    addObject(copy, address);
    this.args.onChangeCCAddresses?.(copy);
    this.showCCModal = false;
  }

  @action
  removeCCAddress(address) {
    const copy = this.args.ccAddresses?.slice() ?? [];
    removeObject(copy, address);
    this.args.onChangeCCAddresses?.(copy);
  }
}
