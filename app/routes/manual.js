import Route from '@ember/routing/route';

export default class ManualRoute extends Route {
  beforeModel() {
    window.location.replace('/Kaleidos_Raadplegen_20200629.pdf');
  }
}
