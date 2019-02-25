import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function () {
  this.route('agendas', { path: "/" });
  this.route('cases', { path: '/dossiers' }, function () {
    this.route('case', { path: ':id' }, function () {
      this.route('subcases', { path: '/deeldossiers' }, function () {
        this.route('create');
        this.route('overview', { path: '' });
        this.route('subcase', { path: ':subcase_id' });
      });
    });
    this.route('overview', { path: '' });
  });
  this.route('comparison');
  this.route('settings');
  this.route('subcases');
});

export default Router;
