/* eslint-disable object-curly-newline */
import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  this.route('agendas', { path: '/', }, function() {
    this.route('overview', { path: '/overzicht', });
  });
  this.route('agenda', { path: '/vergadering/:meeting_id/agenda/:agenda_id', }, function() {
    this.route('print', { path: '/afdrukken', });
    this.route('agendaitems', { path: '/agendapunten', }, function() {
      this.route('agendaitem', { path: '/:agendaitem_id', }, function() {
        this.route('index', { path: '/', });
        this.route('documents', { path: '/documenten', });
        this.route('decisions', { path: '/beslissingen', });
        this.route('news-item', { path: '/kort-bestek', });
        this.route('press-agenda', { path: '/persagenda', });
      });
    });
    this.route('compare', { path: '/vergelijken', });
    this.route('documents', { path: '/documenten', });
  });
  this.route('cases', { path: '/dossiers', }, function() {
    this.route('case', { path: ':id', }, function() {
      this.route('subcases', { path: '/deeldossiers', }, function() {
        this.route('overview', { path: '', });
        this.route('subcase', { path: ':subcase_id', }, function() {
          this.route('documents', { path: '/documenten', });
          this.route('overview', { path: '/overzicht', });
        });
        this.route('loading', { path: '/laden', });
      });
    });
    this.route('overview', { path: '', });
  });
  this.route('settings', { path: '/instellingen', }, function() {
    this.route('ministers');
    this.route('overview', { path: '/overzicht', });
    this.route('users', { path: '/gebruikers', }, function() {
      this.route('user', { path: '/:id', });
    });
    this.route('system-alerts', { path: '/systeemmeldingen', }, function() {
      this.route('edit', { path: '/:alert_id', });
      this.route('new', { path: '/nieuw', });
    });
    this.route('government-domains', () => {});
    this.route('government-fields', () => {});
    this.route('ise-codes', () => {});
    this.route('document-types', () => {});
    this.route('case-types', () => {});
    this.route('subcase-types', () => {});
    this.route('signature', () => {});
  });
  this.route('loading', { path: '/laden', });
  this.route('mock-login-route', { path: '/mock-login', });
  this.route('login', { path: '/aanmelden', });

  this.route('route-not-found', {
    path: '/*wildcard',
  });

  this.route('newsletters', { path: '/kort-bestek', });

  this.route('newsletter', { path: '/vergadering/:meeting_id/kort-bestek', }, function() {
    this.route('index', { path: '/', });
    this.route('print', { path: '/afdrukken', });
    this.route('nota-updates');
  });

  this.route('print-overviews', { path: '/overzicht/:meeting_id', }, function() {
    this.route('decisions', { path: '/beslissingen/:agenda_id', }, function() {
      this.route('agendaitems', { path: '/agendapunten', });
    });
    this.route('press-agenda', { path: '/persagenda/:agenda_id', }, function() {
      this.route('overview', { path: '/klad', });
      this.route('agendaitems', { path: '/agendapunten', });
    });
    this.route('newsletter', { path: '/kort-bestek/:agenda_id', }, function() {
      this.route('overview', { path: '/klad', });
      this.route('loading', { path: '/laden', });
    });
    this.route('loading', { path: '/laden', });
  });
  this.route('accountless-users', { path: '/onbevoegde-gebruiker', });
  this.route('document-viewer', { path: '/document/:piece_id', });

  this.route('not-supported');
  this.route('help');
  this.route('manual', { path: '/handleiding', });

  this.route('styleguide', function() {
    this.route('alerts');
    this.route('buttons');
    this.route('documents');
    this.route('icons');
    this.route('inputs');
    this.route('panels');
    this.route('pills');
    this.route('typography');
    this.route('selects');
  });

  this.route('search', { path: '/zoeken', }, function() {
    this.route('cases', { path: '/dossiers', });
    this.route('agenda-items', { path: '/agendapunten', });
  });

  this.route('publications', { path: '/publicaties', }, function() {
    this.route('in-progress', { path: '/in-behandeling', });
    this.route('done', { path: '/behandeld', });
  });
});

export default Router;
