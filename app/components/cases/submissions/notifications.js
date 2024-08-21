import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { task } from 'ember-concurrency';

export default class CasesSubmissionsNotificationsComponent extends Component {
  @service store;
  @service toaster;

  @tracked showApprovalAddressModal = false;
  @tracked showNotificationAddressModal = false;
  @tracked emailSettings;
  @tracked isEditing = false;


  constructor() {
    super(...arguments);
    if (this.args.isEditing) {
      this.isEditing = true;
    }
    this.loadEmailSettings.perform();
  }

  loadEmailSettings = task(async () => {
    this.emailSettings = await this.store.queryOne(
      'email-notification-setting'
    );
    if (this.emailSettings) {
      await this.updateDefaultAddresses.perform();
    } else {
      this.toaster.warning(
        this.intl.t('notification-mails-could-not-be-sent'),
        this.intl.t('warning-title')
      );
    }
  });

  updateDefaultAddresses = task(async () => {
    await this.addApprovalAddress(this.defaultApprovalAddress, true);
    await this.removeNotificationAddress(this.unusedDefaultNotificationAddress);
    await this.addNotificationAddress(this.defaultNotificationAddress, true);
  });

  get defaultApprovalAddress() {
    return this.emailSettings?.cabinetSubmissionsSecretaryEmail;
  }

  get defaultNotificationAddress() {
    if (this.args.confidential) {
      return this.emailSettings?.cabinetSubmissionsIkwConfidentialEmail;
    } else {
      return this.emailSettings?.cabinetSubmissionsIkwEmail;
    }
  }

  get unusedDefaultNotificationAddress() {
    if (this.args.confidential) {
      return this.emailSettings?.cabinetSubmissionsIkwEmail;
    } else {
      return this.emailSettings?.cabinetSubmissionsIkwConfidentialEmail;
    }
  }

  get notificationData() {
    return {
      approvalAddresses: this.args.approvalAddresses,
      approvalComment: this.args.approvalComment,
      notificationAddresses: this.args.notificationAddresses,
      notificationComment: this.args.notificationComment
    }
  }

  @action
  isDefaultApprovalAddress(address) {
    return address === this.defaultApprovalAddress;
  }

  @action
  isDefaultNotificationAddress(address) {
    return address === this.defaultNotificationAddress;
  }

  @action
  addApprovalAddress(address, insertAsFirst) {
    if (!this.notificationData.approvalAddresses.includes(address)) {
      let newNotificationData = this.notificationData;
      if (insertAsFirst === true) {
        newNotificationData.approvalAddresses.splice(0, 0, address)
      } else {
        newNotificationData.approvalAddresses.push(address);
      }
      this.args.onNotificationDataChanged?.(newNotificationData);
    }
    this.showApprovalAddressModal = false;
  }

  @action
  removeApprovalAddress(address) {
    const index = this.notificationData.approvalAddresses.indexOf(address);
    if (index > -1) {
      let newNotificationData = this.notificationData;
      newNotificationData.approvalAddresses.splice(index, 1);
      this.args.onNotificationDataChanged?.(newNotificationData);
    }
  }

  @action
  addNotificationAddress(address, insertAsFirst) {
    if (!this.notificationData.notificationAddresses.includes(address)) {
      let newNotificationData = this.notificationData;
      if (insertAsFirst === true) {
        newNotificationData.notificationAddresses.splice(0, 0, address)
      } else {
        newNotificationData.notificationAddresses.push(address);
      }
      this.args.onNotificationDataChanged?.(newNotificationData);
    }
    this.showNotificationAddressModal = false;
  }

  @action
  removeNotificationAddress(address) {
    const index = this.notificationData.notificationAddresses.indexOf(address);
    if (index > -1) {
      let newNotificationData = this.notificationData;
      newNotificationData.notificationAddresses.splice(index, 1);
      this.args.onNotificationDataChanged?.(newNotificationData);
    }
  }

  saveNotificationData = task(async () => {
    await this.args.onSaveNotificationData?.();
    this.isEditing = false;
  });

  @action
  onChangeApprovalComment(newComment) {
    let newNotificationData = this.notificationData;
    newNotificationData.approvalComment = trimText(newComment);
    this.args.onNotificationDataChanged?.(newNotificationData);
  }

  @action
  onChangeNotificationComment(newComment) {
    let newNotificationData = this.notificationData;
    newNotificationData.notificationComment = trimText(newComment);
    this.args.onNotificationDataChanged?.(newNotificationData);
  }
}
