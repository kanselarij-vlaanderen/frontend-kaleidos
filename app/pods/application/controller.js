import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';

export default Controller.extend({
  currentSession: service(),
  session: service(),
  router: service(),
  systemAlert: service(),
  toaster: service(),

  options: A([
    {
      key: 'flemish-government', route: 'agendas',
    }
  ]),

  selectedOption: computed('options', function() {
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

  showHeader: computed('currentSession.userRole', function () {
    let role = this.get('currentSession.userRole');
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
