import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('cases', { path : '/dossiers' },  function () {
    this.route('create');
    this.route('case', { path: ':id' }, function ()  {
      this.route('subcases', { path: '/deeldossiers' }, function() {
        this.route('create');
        this.route('overview');
      });
    });
    this.route('overview', { path: '/' });
  });
  this.route('home', { path: "/" });
  this.route('settings');
  this.route('sessions', {path: '/zittingen'}, function() {
    this.route('session', { path: ":id"}, function() {
      this.route('subcases');
      this.route('agendas', function() {
        this.route('agenda',{ path: ":agendaid" }, function() {
          this.route('agendaitems');
        });
      });
    });
  });
});

export default Router;
