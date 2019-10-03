import Controller from '@ember/controller';
import { computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import CONFIG from 'fe-redpencil/utils/config';
import { A } from '@ember/array';
import moment from "moment";
import { later } from '@ember/runloop';
const timeout = 60000;
export default Controller.extend(isAuthenticatedMixin, {
  currentSession: inject(),
  session: inject(),
  router: inject(),
  globalError: inject(),

  messages: alias('globalError.messages'),
  options: A([
    { key: 'main-nav-title', route: 'agendas' },
    // { key: 'main-nav-oc-title', route: 'oc' }, // Hide oc nav option, as the first release won't feature any OC data
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
    const dateOfToday = moment()
      .utc()
      .format();
    try {
      const alerts = await this.store.query("alert", {
        filter: {
          ":gte:end-date": dateOfToday
        },
        sort: "-begin-date",
        include: "type"
      });
      if (alerts.get("length") > 0) {
        this.set('alert', alerts.get("firstObject"));
      }
      return null;
    } catch (e) {
      return null;
    } finally {
      later(this, () => {
        this.startCheckingAlert();
      }, timeout);
    }

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
      const vrHeader= document.getElementById('vlaanderen-header');
      if (this.isOc) {
        if(vrHeader){
          vrHeader.style = 'display:none;';
        }
      }
      if (CONFIG.routesAllowed.includes(currentRouteName)) {
        if(vrHeader){
          vrHeader.style = 'display:none;';
          }
        if (mainNav) {
          mainNav.style = 'display:none;';
        }
      } else {
        if (!this.isOc) {
          if(vrHeader){
            vrHeader.style = 'display:block;';
            }
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

  type: computed('alert', async function() {
    const { alert } = this;
    if (alert) {
      const type = await alert.get('type.label');
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
