import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import fetch from 'fetch';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SignaturesOngoingController extends Controller {
  queryParams = [
    {
      page: {
        type: 'number',
      },
      size: {
        type: 'number',
      },
      sort: {
        type: 'string',
      },
    },
  ];

  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[1];
  @tracked sort = 'decision-activity.start-date';

  isConfidential = (accessLevel) => {
    return [
      CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE,
      CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK,
    ].includes(accessLevel.get('uri'));
  }

  getMandateeNames = async (signFlow) => {
    const signSubcase = await signFlow.signSubcase;
    const signSigningActivities = await signSubcase.signSigningActivities;
    const mandatees = await Promise.all(
      signSigningActivities.map((activity) => activity.mandatee)
    );
    const persons = await Promise.all(
      mandatees
        .toArray()
        .sort((m1, m2) => m1.priority - m2.priority)
        .map((mandatee) => mandatee.person)
    );
    return persons.map((person) => person.fullName);
  }

  getSigningHubUrl = async (signFlow) => {
    const signSubcase = await signFlow.signSubcase;
    const signMarkingActivity = await signSubcase.signMarkingActivity;
    const piece = await signMarkingActivity.piece;

    if (piece) {
      const response = await fetch(
        `/signing-flows/${signFlow.id}/pieces/${piece.id}/signinghub-url?collapse_panels=false`
      );
      if (response.ok) {
        const result = await response.json();
        return result.url;
      }
    }
  }
}
