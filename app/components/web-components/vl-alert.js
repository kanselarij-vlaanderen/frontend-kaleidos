import Component from '@glimmer/component';

export default class VlAlertComponent extends Component {
  get typeClass() {
    const classType = this.args.type;
    if (['success', 'error', 'warning'].includes(classType)) {
      return `vl-alert--${classType}`;
    }
    return null;
  }

  get iconName() {
    const currentType = this.args.type;
    if (['warning', 'error'].includes(currentType)) {
      return 'alert-triangle';
    } else if (currentType === 'success') {
      return 'check';
    }
    return 'info-circle';
  }

  close() {
    this.args.onClose(...arguments);
  }
}
