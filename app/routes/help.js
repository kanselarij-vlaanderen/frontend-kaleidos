import Route from '@ember/routing/route';

export default class HelpRoute extends Route {
  beforeModel() {
    window.location.replace('https://overheid.vlaanderen.be/kaleidos');
  }
}
