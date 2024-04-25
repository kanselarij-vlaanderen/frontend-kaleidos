import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from "@ember/object";
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';
import { setHash } from 'frontend-kaleidos/utils/hash-util';
import { timeout } from 'ember-concurrency';

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
    this.piece = model; // this.model does not exist in local 'applyHash method'
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

    const canSign = this.currentSession.may('manage-signatures');

    if (this.isSigning) {
      if (canSign) {
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
      this.applyHash();
    });
    // Disable bubbling of loading event to prevent main loading route to be shown.
    // Otherwise it causes a 'flickering' effect because the m-header appears when selecting a version.
    return false;
  }

  @action
  async applyHash() {
    // after changing tabs, the hash needs to be re-applied but we don't refresh model
    await timeout(1000);
    setHash(new VRDocumentName(this.piece?.name).vrNumberWithSuffix());
  }
}
