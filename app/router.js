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
  this.route('mock-login');
  this.route('login', { path: '/aanmelden', });
  this.route('accountless-users', { path: '/onbevoegde-gebruiker', });

  // Redirect routes
  this.route('agendaitem', { path: '/agendapunten/:agendaitem_id' });
  this.route('meeting', { path: '/vergaderingen/:meeting_id' });

  this.route('agendas', { path: '/overzicht', });
  this.route('agenda', { path: '/vergadering/:meeting_id/agenda/:agenda_id', }, function() {
    this.route('print', { path: '/afdrukken', });
    this.route('agendaitems', { path: '/agendapunten', }, function() {
      this.route('agendaitem', { path: '/:agendaitem_id', }, function() {
        this.route('documents', { path: '/documenten', });
        this.route('decisions', { path: '/beslissingen', });
        this.route('news-item', { path: '/kort-bestek', });
      });
    });
    this.route('compare', { path: '/vergelijken', });
    this.route('documents', { path: '/documenten', });
  });

  this.route('cases', { path: '/dossiers', }, function() {
    this.route('case', { path: ':id', }, function() {
      this.route('subcases', { path: '/deeldossiers', }, function() {
        this.route('subcase', { path: ':subcase_id', }, function() {
          this.route('documents', { path: '/documenten', });
          this.route('decision', { path: '/beslissing', });
        });
      });
    });
  });

  this.route('newsletters', { path: '/kort-bestek', }, function() {
    this.route('search', { path: '/zoeken', });
  });

  this.route('newsletter', { path: '/vergadering/:meeting_id/kort-bestek', }, function() {
    this.route('print', { path: '/afdrukken', });
    this.route('nota-updates');
  });

  this.route('publications', { path: '/publicaties', }, function() {
    this.route('overview', { path: '/overzicht' }, function () {
      this.route('all', { path: '/alle-dossiers' });
      this.route('urgent', { path: '/dringend' });
      this.route('translation', { path: '/in-vertaling' });
      this.route('proof', { path: '/aanvraag-drukproef' });
      this.route('proofread', { path: '/nalezen' });
      this.route('late', { path: '/te-laat-in-bs' });
      this.route('reports', { path: '/rapporten' });
      this.route('search', { path: '/zoeken' });
    });
    this.route('publication', { path: ':publication_id', }, function() {
      this.route('case', { path: '/dossier', });
      this.route('decisions', { path: '/besluiten', }, function() { });
      this.route('translations', { path: '/vertalingen',}, function() { });
      this.route('proofs', { path: '/drukproeven',}, function() { });
      this.route('publication-activities', { path: '/publicatie', }, function() { });
    });
  });

  if (!isEmpty(ENV.APP.ENABLE_SIGNATURES)) {
    this.route('signatures', { path: '/handtekenmap', }, function() {
      this.route('signing-flow', { path: '/:signingflow_id' }, function() {
        this.route('documents', { path: '/documenten' });
      });
    });
  }

  this.route('search', { path: '/zoeken', }, function() {
    this.route('cases', { path: '/dossiers', });
    this.route('agendaitems', { path: '/agendapunten', });
    this.route('news-items', { path: '/kort-bestek', });
  });

  this.route('settings', { path: '/instellingen', }, function() {
    this.route('ministers');
    this.route('users', { path: '/gebruikers', }, function() {
      this.route('user', { path: '/:id', });
    });
    this.route('organizations', { path: '/organisaties' }, () => {});
    this.route('system-alerts', { path: '/systeemmeldingen', }, function() {
      this.route('edit', { path: '/:alert_id', });
      this.route('new', { path: '/nieuw', });
    });
    this.route('emails', { path: '/emailberichten', });
  });

  this.route('document', { path: '/document/:piece_id', });

  this.route('not-supported');
  this.route('help');
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
    this.route('checkbox-tree');
    this.route('radio-buttons');
    this.route('colors');
    this.route('color-badge');
    this.route('datepicker');
    this.route('empty-state');
    this.route('form-group');
    this.route('layout-grid');
    this.route('heading');
    this.route('icons');
    this.route('key-value');
    this.route('link-button');
    this.route('list');
    this.route('loader');
    this.route('panel');
    this.route('pager');
    this.route('pagination');
    this.route('popover');
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
