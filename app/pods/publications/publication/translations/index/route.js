import Route from '@ember/routing/route';

export default class PublicationsPublicationTranslationsIndexRoute extends Route {
  beforeModel() {
    this.transitionTo('publications.publication.translations.documents');
  }
}
