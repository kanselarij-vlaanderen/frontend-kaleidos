import Route from '@ember/routing/route';

export default class PublicationsOverviewRoute extends Route {
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.isShowPublicationModal = false;
    }
  }
}
