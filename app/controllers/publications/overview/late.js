import PublicationsOverviewBaseController from './_base';
import { tracked } from '@glimmer/tracking';

export default class PublicationsOverviewLateController extends PublicationsOverviewBaseController {
  @tracked sort = 'publication-subcase.target-end-date';
}
