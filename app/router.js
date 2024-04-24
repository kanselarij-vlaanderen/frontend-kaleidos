import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import ENV from 'frontend-kaleidos/config/environment';
import { isEmpty } from '@ember/utils';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

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
        this.route('ratification', { path: '/bekrachtiging', });
      });
    });
    this.route('documents', { path: '/documenten', });
    this.route('submissions', { path: '/indieningen', });
    if (ENV.APP.ENABLE_DIGITAL_MINUTES === "true" || ENV.APP.ENABLE_DIGITAL_MINUTES === true) {
      this.route('minutes', { path: '/notulen', });
    }

  });

  this.route('cases', { path: '/dossiers', }, function() {
    this.route('submissions', { path: '/indieningen', });
    this.route('add-agendapoint', { path: '/indiening-toevoegen', });
    this.route('case', { path: ':id', }, function() {
      this.route('subcases', { path: '/deeldossiers', }, function() {
        this.route('subcase', { path: ':subcase_id', }, function() {
          this.route('documents', { path: '/documenten', });
          this.route('decision', { path: '/beslissing', });
        });
        this.route('add-subcase', { path: '/procedurestap-toevoegen', });
        this.route('add-agendapoint', { path: '/agendapunt-toevoegen', });
      });
      this.route('subcases-demo', { path: '/deeldossiers-demo', }, function() {
        this.route('subcase-demo', { path: ':subcase_id', }, function() {
          this.route('publication', { path: '/publicatie', });
          this.route('ratification', { path: '/bekrachtiging', });
          this.route('vp', { path: '/vlaamsparlement', });
          this.route('first-approval', { path: '/eerste-principiele-goedkeuring', });
          this.route('second-approval', { path: '/tweede-principiele-goedkeuring', });
          this.route('final-approval', { path: '/definitieve-goedkeuring', });
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
      this.route('shortlist', { path: '/op-te-starten' });
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
    this.route('signatures', { path: '/ondertekenen', }, function() {
      this.route('index', { path: '/op-te-starten' });
      this.route('ongoing', { path: '/op-te-volgen' });
      this.route('decisions-and-notes', { path: '/beslissingen-en-notulen' });
      this.route('ongoing-decisions-and-notes', { path: '/op-te-volgen-beslissingen-en-notulen' });
      this.route('ratification', { path: '/bekrachtigingen' });
      this.route('ongoing-ratification', { path: '/op-te-volgen-bekrachtigingen' });
    });
  }

  this.route('search', { path: '/zoeken', }, function() {
    this.route('cases', { path: '/dossiers', });
    this.route('agendaitems', { path: '/agendapunten', });
    this.route('documents', { path: '/documenten'});
    this.route('decisions', { path: '/beslissingen' });
    this.route('news-items', { path: '/kort-bestek', });
    this.route('all-types', { path: '/alle-types' });
    this.route('publications', { path: '/publicaties' });
  });

  this.route('settings', { path: '/instellingen', }, function() {
    this.route('ministers');
    this.route('users', { path: '/gebruikers', }, function() {
      this.route('user', { path: '/:id', });
    });
    this.route('organizations', { path: '/organisaties' }, function() {
      this.route('organization', {path: '/:id', });
    });
    this.route('system-alerts', { path: '/systeemmeldingen', }, function() {
      this.route('edit', { path: '/:alert_id', });
      this.route('new', { path: '/nieuw', });
    });
    this.route('emails', { path: '/emailberichten', });
    this.route('decisions-and-notes-signees', { path: '/beslissingondertekenaars-beheer', });
  });

  this.route('document', { path: '/document/:piece_id', });
  this.route('email-template', { path: '/email', });

  this.route('not-supported');
  this.route('help');
  this.route('route-not-found', { path: '/*wildcard', });

  this.route('styleguide', function() {
    this.route('accordion');
    this.route('accordion-panel');
    this.route('avatar');
    this.route('brand');
    this.route('button-loading');
    this.route('button-skins');
    this.route('button-types');
    this.route('checkbox-tree');
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
