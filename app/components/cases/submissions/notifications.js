import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { addObject, removeObject } from 'frontend-kaleidos/utils/array-helpers';

export default class CasesSubmissionsNotificationsComponent extends Component {

  @tracked showNotifiersModal = false;
  @tracked showNotificationModal = false;

  addedApprovalAddresses = new Set();

  @action
  isDefaultApprovalAddress(address) {
    return !this.addedApprovalAddresses.has(address);
  }

  @action
  saveApprovalAddress(address) {
    this.addedApprovalAddresses.add(address);
    const copy = this.args.approvalAddresses?.slice() ?? [];
    addObject(copy, address);
    this.args.onChangeApprovalAddresses?.(copy);
    this.showNotifiersModal = false;
  }

  @action
  removeApprovalAddress(address) {
    this.addedApprovalAddresses.delete(address);
    const copy = this.args.approvalAddresses?.slice() ?? [];
    removeObject(copy, address);
    this.args.onChangeApprovalAddresses?.(copy);
  }

  @action
  saveNotificationAddress(address) {
    const copy = this.args.ccAddresses?.slice() ?? [];
    addObject(copy, address);
    this.args.onChangeNotificationAddresses?.(copy);
    this.showNotificationModal = false;
  }

  @action
  removeNotificationAddress(address) {
    const copy = this.args.ccAddresses?.slice() ?? [];
    removeObject(copy, address);
    this.args.onChangeNotificationAddresses?.(copy);
  }
}
