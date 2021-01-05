import Component from '@glimmer/component';

export default class VlAlertComponent extends Component {
  get typeClass() {
    const classType = this.args.type;
    if (['success', 'error', 'warning'].includes(classType)) {
      return `vl-alert--${classType}`;
    }
    return null;
  }

  get iconClass() {
    const classes = ['ki'];
    const currentType = this.args.type;
    if (['warning', 'error'].includes(currentType)) {
      classes.push('ki-alert-triangle');
    } else if (currentType === 'success') {
      classes.push('ki-check');
    } else {
      classes.push('ki-info-circle');
    }
    return classes.join(' ');
  }

  close() {
    this.args.onClose(...arguments);
  }
}
