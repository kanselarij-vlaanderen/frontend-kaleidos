import Component from '@glimmer/component';

export default class extends Component {
  classNames = ['vl-alert'];
  classNameBindings = [
    'typeClass',
    'args.small:vl-alert--small'
  ];

  get typeClass() {
    const t = this.args.type;
    if (['success', 'error', 'warning'].includes(t)) {
      return `vl-alert--${t}`;
    } else {
      return null;
    }
  }

  get iconClass() {
    const classes = ['vl-vi'];
    const t = this.args.type;
    if (['warning', 'error'].includes(t)) {
      classes.push('vl-vi-alert-triangle');
    } else if (t === 'success') {
      classes.push('vl-vi-check');
    } else {
      classes.push('vl-vi-alert-circle');
    }
    return classes.join(' ');
  }

  close() {
    this.onClose(...arguments);
  }

}
