import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function () {
  this.route('agendas', { path: "/agendas" });
  this.route('agenda', {path: '/agenda/:id'}, function() {
    this.route('agendaitems', function() {
      this.route('agendaitem', {path: '/:agendaitem_id'});
    });
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
  this.route('comparison');
  this.route('settings');
  this.route('subcases');
  this.route('loading');

  this.route('route-not-found', {
    path: '/*wildcard'
  });
  this.route('newsletters');
  this.route('newsletters-overview', { path: ':meeting_id'});
});

export default Router;
