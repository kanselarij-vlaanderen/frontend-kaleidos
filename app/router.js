import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('tasks');
  this.route('agenda');
  this.route('files');
  this.route('home', { path: "/" });
  this.route('settings');
});

export default Router;
