import Route from '@ember/routing/route';

export default class ManualRoute extends Route {
  beforeModel() {
    window.location.replace('/handleiding.pdf');
  }
}
