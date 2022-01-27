/* eslint-disable object-curly-newline */
import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import ENV from 'frontend-kaleidos/config/environment';
import { isEmpty } from '@ember/utils';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  // mock-login-route as name to avoid collision with mock-login component provided by addon
  this.route('mock-login-route', { path: '/mock-login', });
  this.route('login', { path: '/aanmelden', });
  this.route('accountless-users', { path: '/onbevoegde-gebruiker', });

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
          this.route('decision', { path: '/beslissing', });
        });
        this.route('loading', { path: '/laden', });
      });
    });
    this.route('overview', { path: '', });
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

  if (!isEmpty(ENV.APP.ENABLE_PUBLICATIONS_TAB)) {
    this.route('publications', { path: '/publicaties', }, function() {
      this.route('overview', { path: '/overzicht' }, function () {
        this.route('all', { path: '/alle-dossiers' })
      });
      this.route('publication', { path: ':publication_id', }, function() {
        this.route('case', { path: '/dossier', });
        this.route('documents', { path: '/documenten', });
        this.route('translations', { path: '/vertalingen', }, function() {
          this.route('documents', { path: '/documenten', });
          this.route('requests', { path: '/aanvragen', });
        });
        this.route('proofs', { path: '/drukproeven', }, function() {
          this.route('documents', { path: '/documenten', });
          this.route('requests', { path: '/aanvragen', });
        });
        this.route('publication-activities', { path: '/publicatie-activiteiten', });
      });
    });
  }

  if (!isEmpty(ENV.APP.ENABLE_SIGNATURES)) {
    this.route('signatures', { path: '/handtekenmap', }, function() {
      this.route('index', { path: '/overzicht', });
      this.route('signing-flow', { path: '/:signingflow_id' }, function() {
        this.route('documents', { path: '/documenten' });
      });
    });
  }

  this.route('search', { path: '/zoeken', }, function() {
    this.route('cases', { path: '/dossiers', });
    this.route('agenda-items', { path: '/agendapunten', });
    this.route('newsletter-infos', { path: '/kort-bestek', });
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
    this.route('emails', { path: '/emailberichten', });
    this.route('document-types', () => {});
    this.route('case-types', () => {});
    this.route('subcase-types', () => {});
  });

  this.route('document', { path: '/document/:piece_id', });

  this.route('loading', { path: '/laden', });
  this.route('not-supported');
  this.route('help');
  this.route('manual', { path: '/handleiding', });
  this.route('route-not-found', { path: '/*wildcard', });

  this.route('styleguide', function() {
    this.route('accordion');
    this.route('accordion-panel');
    this.route('alert-skins');
    this.route('alert-types');
    this.route('alert-stack');
    this.route('avatar');
    this.route('brand');
    this.route('badge');
    this.route('button-loading');
    this.route('button-skins');
    this.route('button-types');
    this.route('checkboxes-radio-buttons');
    this.route('colors');
    this.route('color-badge');
    this.route('dropdown');
    this.route('empty-state');
    this.route('form-group');
    this.route('layout-grid');
    this.route('heading');
    this.route('icons');
    this.route('inputs');
    this.route('key-value');
    this.route('link-button');
    this.route('list');
    this.route('loader');
    this.route('panel');
    this.route('pager');
    this.route('pagination');
    this.route('popover');
    this.route('pill');
    this.route('search-results-list');
    this.route('status-pill');
    this.route('table');
    this.route('tabs');
    this.route('toolbar');
    this.route('navbar');
    this.route('modal');
    this.route('typography');
    this.route('upload');
  });
});

export default Router;
