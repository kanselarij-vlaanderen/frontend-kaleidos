import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import Snapshot from 'frontend-kaleidos/utils/snapshot';

export default class SignaturesRatificationsRoute extends Route {
  @service store;
  @service currentSession;

  queryParams = {
    pageSignaturesRatifications: {
      refreshModel: true,
      as: 'pagina',
    },
    sizeSignaturesRatifications: {
      refreshModel: true,
      as: 'aantal',
    },
    sortSignaturesRatifications: {
      refreshModel: true,
      as: 'sorteer',
    }
  };
  lastParams;

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  async beforeModel() {
    if (!this.currentSession.may('manage-secretary-signatures')) {
      this.router.transitionTo('index');
    }
  }

  async model(params) {
    this.lastParams.stageLive(params);

    if (
      this.lastParams.anyFieldChanged(
        Object.keys(params).filter((key) => key !== 'pageSignaturesRatifications')
      )
    ) {
      params.pageSignaturesRatifications = 0;
    }

    const filter = {
      'sign-subcase': {
        'sign-marking-activity': {
          piece: {
            ':has-no:next-piece': true,
            'document-container': {
              type: {
                ':uri:': CONSTANTS.DOCUMENT_TYPES.BEKRACHTIGING,
              },
            },
          }
        },
        ':has-no:sign-preparation-activity': true,
      },
      status: {
        ':uri:': CONSTANTS.SIGNFLOW_STATUSES.MARKED,
      },
      'decision-activity': {
        'decision-result-code': {
          ':id:': [
            CONSTANTS.DECISION_RESULT_CODE_IDS.GOEDGEKEURD,
            CONSTANTS.DECISION_RESULT_CODE_IDS.KENNISNAME,
          ].join(','),
        },
        'treatment': {
          agendaitems: {
            agenda: {
              meeting: {
                'internal-decision-publication-activity': {
                  ':has:start-date': `date-added-for-cache-busting-${new Date().toISOString()}`,
                },
              },
            },
          }
        }
      },
    };

    this.lastParams.commit();

    return this.store.query('sign-flow', {
      filter,
      include: [
        'decision-activity',
        'sign-subcase.sign-marking-activity.piece.document-container.type',
        'meeting'
      ].join(','),
      page: {
        number: params.pageSignaturesRatifications,
        size: params.sizeSignaturesRatifications,
      },
      sort: params.sortSignaturesRatifications,
    });
  }

  setupController(controller, model, transition) {
    super.setupController(controller, model, transition);

    if (controller.pageSignaturesRatifications !== this.lastParams.committed.pageSignaturesRatifications) {
      controller.pageSignaturesRatifications = this.lastParams.committed.pageSignaturesRatifications;
    }
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.showSidebar = false;
      controller.piece = null;
      controller.decisionActivity = null;
      controller.agendaitem = null;
      controller.agenda = null;
      controller.meeting = null;
    }
  }
}
