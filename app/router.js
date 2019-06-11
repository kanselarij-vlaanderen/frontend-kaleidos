import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function () {
  this.route('agendas', { path: "/" });
  this.route('agenda', { path: '/agenda/:id' }, function () {
    this.route('agendaitems', { path: "/agendapunten" }, function () {
      this.route('agendaitem', { path: '/:agendaitem_id' });
    });
    this.route('compare', { path: "/vergelijken" });
  });
  this.route('cases', { path: '/dossiers' }, function () {
    this.route('case', { path: ':id' }, function () {
      this.route('subcases', { path: '/deeldossiers' }, function () {
        this.route('overview', { path: '' });
        this.route('subcase', { path: ':subcase_id' });
        this.route('loading');
      });
    });
    this.route('overview', { path: '' });
  });
  this.route('settings', { path: "/instellingen" });
  this.route('loading');
  this.route('mock-login');
  this.route('login');

  this.route('route-not-found', {
    path: '/*wildcard'
  });

  this.route('newsletters');
  this.route('newsletters-overview', { path: ':meeting_id' });
  this.route('print-overviews', { path: "/overzicht/:meeting_id" }, function () {
    this.route('notes', { path: "/notulen/:agenda_id" }, function () {
      this.route('overview', { path: "/klad" });
      this.route('agendaitems', { path: '/agendapunten' });
    });
    this.route('decisions', { path: "/beslissingen/:agenda_id" }, function () {
      this.route('overview', { path: "/klad" });
      this.route('agendaitems', { path: '/agendapunten' });
    });
    this.route('press-agenda', { path: "/persagenda/:agenda_id" }, function () {
      this.route('overview', { path: "/klad" });
      this.route('agendaitems', { path: '/agendapunten' });
    });

  });
  this.route('accountless-users');
  this.route('document-viewer', { path: '/document/:document_version_id', });
});

export default Router;
