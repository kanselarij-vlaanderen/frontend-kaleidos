import Controller from '@ember/controller';
import { computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { A } from '@ember/array';
import { later } from '@ember/runloop';

const timeout = 60000;

export default Controller.extend(isAuthenticatedMixin, {
  currentSession: inject(),
  session: inject(),
  router: inject(),
  globalError: inject(),

  messages: alias('globalError.messages'),
  options: A([
    { key: 'flemish-government', route: 'agendas' },
  ]),

  selectedOption: computed('options', function() {
    return this.options.get('firstObject');
  }),

  isOc: computed('selectedOption', function() {
    return this.get('selectedOption.route') == 'oc';
  }),

  async init() {
    this._super(...arguments);
    document.addEventListener('wheel', () => {}, {
      capture: true,
      passive: true,
    });

    this.startCheckingAlert();
  },

  async startCheckingAlert() {
    const today = `${new Date().toISOString().substr(0, 11)}00:00:00`;
    try {
      const alerts = await this.store.query('alert', {
        filter: {
          ':gte:end-date': today,
        },
        sort: '-begin-date',
        include: 'type',
        page: { size: 10 }
      });
      if (alerts.length) {
        const now = new Date();
        const activeAlert = alerts.find(a => a.endDate > now);
        if (activeAlert)
          this.set('alert', activeAlert);
      }
    } catch (e) {
      // No alerts. Nothing should happen
    } finally {
      later(
        this,
        () => {
          this.startCheckingAlert();
        },
        timeout
      );
    }
  },

  async checkAccountlessUser(currentRouteName) {
    if (currentRouteName.includes('loading')) {
      return;
    }

    const user = await this.get('session.isAuthenticated');
    if (!user) {
      return;
    }

    const role = await this.get('currentSession.userRole');
    if (role == 'no-access') {
      this.transitionToRoute('accountless-users');
    }
  },

  shouldNavigateObserver: on(
    'init',
    observer(
      'router.currentRouteName',
      'currentSession.userRole',
      'session.isAuthenticated',
      function() {
        const { router } = this;
        if (!router || !router.currentRouteName) {
          return;
        }
        const currentRouteName = router.get('currentRouteName');
        this.checkAccountlessUser(currentRouteName);
      }
    )
  ),

  showHeader: computed('role', function() {
    let role = this.get('role');
    return role && role !== '' && role !== 'no-access';
  }),

  type: computed('alert', async function() {
    const { alert } = this;
    if (!alert) {
      return;
    }
    const type = await alert.get('type.label');
    if (type === 'Waarschuwing') {
      return 'vl-alert--warning';
    } else if (type === 'Dringend') {
      return 'vl-alert--error';
    }
  }),

  actions: {
    close() {
      this.set('alert', null);
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
