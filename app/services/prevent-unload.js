import Service, { inject as service } from '@ember/service';

export default class PreventUnloadService extends Service {
  @service router;

  enabled = false;

  enable = () => {
    if (!this.enabled) {
      this.enabled = true;
      window.addEventListener('beforeunload', this.__windowListener);
      this.router.on('routeWillChange', this.__emberListener);
    }
  }

  disable = () => {
    if (this.enabled) {
      this.enabled = false;
      window.removeEventListener('beforeunload', this.__windowListener);
      this.router.off('routeWillChange', this.__emberListener);
    }
  }

  __windowListener = (event) => {
    event.preventDefault();
    event.returnValue = true;
  }

  __emberListener = (transition) => {
    if (
      !transition.to.find(route => route.name === this.router.currentRouteName) &&
      !transition.to.localName === 'loading' &&
      !confirm('Als u de pagina nu verlaat bent u alle aanpassingen kwijt. Bent u zeker dat u weg wilt navigeren?')) {
      transition.abort();
    }
  }
}
