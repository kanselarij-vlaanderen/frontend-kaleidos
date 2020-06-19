import Controller from '@ember/controller';
import { computed, observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';

export default Controller.extend({
  currentSession: service(),
  session: service(),
  router: service(),
  systemAlert: service(),
  toaster: service(),

  options: A([
    { key: 'flemish-government', route: 'agendas' },
  ]),

  selectedOption: computed('options', function () {
    return this.options.get('firstObject');
  }),

  async init() {
    this._super(...arguments);
    document.addEventListener('wheel', () => {
    }, {
      capture: true,
      passive: true,
    });
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
    if (role === 'no-access') {
      this.transitionToRoute('accountless-users');
    }
  },

  shouldNavigateObserver: on(
    'init',
    observer(
      'router.currentRouteName',
      'currentSession.userRole',
      'session.isAuthenticated',
      function () {
        const { router } = this;
        if (!router || !router.currentRouteName) {
          return;
        }
        const currentRouteName = router.get('currentRouteName');
        this.checkAccountlessUser(currentRouteName);
      },
    ),
  ),

  showHeader: computed('currentSession.userRole', function () {
    const role = this.get('currentSession.userRole');
    return role && role !== '' && role !== 'no-access';
  }),

  actions: {
    navigateToLogin() {
      this.transitionToRoute('login');
    },

    navigateToRoute(option) {
      this.transitionToRoute(option.route);
    },
  },
});
