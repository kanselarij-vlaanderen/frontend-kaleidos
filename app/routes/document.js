import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from "@ember/object";
import ENV from 'frontend-kaleidos/config/environment';

export default class DocumentRoute extends Route {
  @service('session') simpleAuthSession;
  @service currentSession;
  @service store;
  @service intl;

  queryParams = {
    tab: {
      refreshModel: false,
      replace: true,
      as: 'tab',
    }
  }

  isSigning = false;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, this.simpleAuthSession.unauthenticatedRouteName);
  }

  async model(params) {
    const model = await this.store.queryOne('piece', {
      'filter[:id:]': params.piece_id,
      include: 'file',
    });
    return model;
  }

  async afterModel(model) {
    this.decisionActivity = await this.store.queryOne('decision-activity', {
      filter: {
        report: {
          ':id:': model?.id,
        },
      },
    });

    const params = this.paramsFor(this.routeName);
    this.isSigning = params.tab === this.intl.t('signatures');
  }

  setupController(controller) {
    super.setupController(...arguments);

    const signaturesEnabled = !!ENV.APP.ENABLE_SIGNATURES;
    const canSign = this.currentSession.may('manage-signatures');

    if (this.isSigning) {
      if (signaturesEnabled && canSign) {
        controller.tab = this.intl.t('signatures');
      }  else {
        controller.tab = 'details';
      }
    }
    controller.decisionActivity = this.decisionActivity;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.isSigning = false;
      controller.tab = 'details';
    }
  }

  @action
  loading(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.isLoadingModel = true;
    transition.promise.finally(() => {
      controller.isLoadingModel = false;
    });
    // Disable bubbling of loading event to prevent main loading route to be shown.
    // Otherwise it causes a 'flickering' effect because the m-header appears when selecting a version.
    return false;
  }
}
