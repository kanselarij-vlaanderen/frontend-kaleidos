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
    const classes = ['vl-vi'];
    const currentType = this.args.type;
    if (['warning', 'error'].includes(currentType)) {
      classes.push('vl-vi-alert-triangle');
    } else if (currentType === 'success') {
      classes.push('vl-vi-check');
    } else {
      classes.push('vl-vi-alert-circle');
    }
    return classes.join(' ');
  }

  close() {
    this.args.onClose(...arguments);
  }
}
