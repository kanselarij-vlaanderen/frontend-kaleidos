import Controller from '@ember/controller';
import { computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import CONFIG from 'fe-redpencil/utils/config';
import { A } from '@ember/array';

export default Controller.extend(isAuthenticatedMixin, {
  currentSession: inject(),
  session: inject(),
  router: inject(),
  globalError: inject(),

  messages: alias('globalError.messages'),
  options: A([
    { key: 'main-nav-title', route: 'agendas' },
    { key: 'main-nav-oc-title', route: 'oc' },
  ]),

  selectedOption: computed('options', function() {
    return this.options.get('firstObject');
  }),

  isOc: computed('selectedOption', function() {
    return this.get('selectedOption.route') == 'oc';
  }),

  init() {
    this._super(...arguments);
    document.addEventListener('wheel', () => {}, {
      capture: true,
      passive: true,
    });
  },

  shouldNavigateObserver: on(
    'init',
    observer('router.currentRouteName', 'currentSession.userRole', async function() {
      const currentRouteName = this.router.get('currentRouteName');

      if (currentRouteName && currentRouteName.startsWith('oc.')) {
        this.set('selectedOption', this.options[1]);
      } else {
        this.set('selectedOption', this.options[0]);
      }
      const mainNav = document.getElementById('c-main-nav');
      if (this.isOc) {
        document.getElementById('vlaanderen-header').style = 'display:none;';
      }
      if (CONFIG.routesAllowed.includes(currentRouteName)) {
        document.getElementById('vlaanderen-header').style = 'display:none;';
        if (mainNav) {
          mainNav.style = 'display:none;';
        }
      } else {
        if (!this.isOc) {
          document.getElementById('vlaanderen-header').style = 'display:block;';
        }
        if (mainNav) {
          mainNav.style = 'display:block;';
        }
      }
      const router = this.get('router');
      const role = await this.get('currentSession.userRole');
      const user = await this.get('session.isAuthenticated');
      if (router && user && role == 'no-access' && currentRouteName != 'loading') {
        this.transitionToRoute('accountless-users');
      }
    })
  ),

  showHeader: computed('role', function() {
    let role = this.get('role');
    return role && role !== '' && role !== 'no-access';
  }),

  type: computed('model', async function() {
    const { model } = this;
    if (model) {
      const type = await model.get('type.label');
      if (type === 'Waarschuwing') {
        return 'vl-alert--warning';
      } else if (type === 'Dringend') {
        return 'vl-alert--error';
      }
    }
    return '';
  }),

  actions: {
    close() {
      this.set('model', null);
    },

    navigateToLogin() {
      this.transitionToRoute('login');
    },

    closeErrorMessage(errorMessage) {
      this.get('globalError.messages').removeObject(errorMessage);
    },

    navigateToRoute(option) {
      this.transitionToRoute(option.route);
    },
  },
});
