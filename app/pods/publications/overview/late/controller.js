import PublicationsOverviewBaseController from '../_base/controller';
import { tracked } from '@glimmer/tracking';

const DEFAULT_COLUMNS = [
  'publicationNumber',
  'numacNumber',
  'shortTitle',
  'publicationTargetDate',
  'publicationDueDate',
];

export default class PublicationsOverviewLateController extends PublicationsOverviewBaseController {
  @tracked defaultColumns = DEFAULT_COLUMNS;
  @tracked routeName = 'late';
  @tracked sort = 'publication-subcase.due-date';
}
