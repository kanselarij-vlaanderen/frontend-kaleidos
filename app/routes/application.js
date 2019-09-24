import Route from "@ember/routing/route";
import { inject } from "@ember/service";
import moment from "moment";

import ApplicationRouteMixin from "ember-simple-auth/mixins/application-route-mixin";

export default Route.extend(ApplicationRouteMixin, {
  moment: inject(),
  intl: inject(),
  currentSession: inject(),
  fileService: inject(),
  routeAfterAuthentication: "agendas",

  beforeModel() {
    this._super(...arguments);
    this.get("moment").setLocale("nl");
    this.set("moment.defaultFormat", "DD.MM.YYYY");
    this.get("moment").set("allowEmpty", true);
    this.intl.setLocale("nl-be");
    return this._loadCurrentSession();
  },

  sessionAuthenticated() {
    this._super(...arguments);
    this._loadCurrentSession();
  },

  sessionInvalidated() {},

  _loadCurrentSession() {
    return this.currentSession.load().catch(() => this.session.invalidate());
  },

  async model() {
    return await this.checkAlerts();
  },

  async checkAlerts() {
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
        const alertToShow = alerts.get("firstObject");
        return alertToShow;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  actions: {
    willTransition: function(transition) {
      if (
        this.fileService.get("deleteDocumentWithUndo.isRunning") &&
        confirm(this.intl.t("leave-page-message"))
      ) {
        transition.abort();
      } else {
        return true;
      }
    }
  }
});
