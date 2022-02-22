import PublicationsOverviewBaseController from '../_base/controller';
import { tracked } from '@glimmer/tracking';

export default class PublicationsOverviewLateController extends PublicationsOverviewBaseController {
  @tracked sort = 'publication-subcase.due-date';
}
