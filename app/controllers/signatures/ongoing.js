import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

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
}
