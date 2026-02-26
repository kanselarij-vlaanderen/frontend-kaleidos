import Service, { service } from '@ember/service';

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

  confirmTransition = (transition) => {
    if(transition.to.localName !== 'loading' && !confirm('Als u de pagina nu verlaat bent u alle aanpassingen kwijt. Bent u zeker dat u weg wilt navigeren?')) {
      transition.abort();
    } else {
      this.disable();
    }
  }

  getParams = (transitionToOrFrom) => {
    let params = transitionToOrFrom.params;
    let parent = transitionToOrFrom.parent;
    while (parent) {
      if (parent.paramNames?.length) {
        params = { ...params, ...parent.params };
      }
      parent = parent.parent;
    }
    return params;
  }

  __emberListener = (transition) => {
    // either the route changed entirely
    const routeChanged = !transition.to.find(route => route.name === this.router.currentRouteName);
    if (routeChanged) {
      return this.confirmTransition(transition);
    }
    // or the params changed within the same route (for example when switching agendaitems)
    let paramsChanged = false;
    let fromParams = this.getParams(transition.from);
    let toParams = this.getParams(transition.to);
    for (const fromParamName in fromParams) {
      if (!paramsChanged && Object.prototype.hasOwnProperty.call(fromParams, fromParamName)) {
        if (toParams[fromParamName] !== fromParams[fromParamName]) {
          paramsChanged = true;
        }
      }
    }
    if (paramsChanged) {
      return this.confirmTransition(transition);
    }
  }
}
