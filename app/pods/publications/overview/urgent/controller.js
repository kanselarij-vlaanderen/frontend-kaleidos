import PublicationsOverviewBaseController from '../_base/controller';
import { tracked } from '@glimmer/tracking';

const DEFAULT_COLUMNS = [
  'publicationNumber',
  'numacNumber',
  'shortTitle',
  'pageCount',
  'publicationDueDate',
];

export default class PublicationsOverviewUrgentController extends PublicationsOverviewBaseController {
  @tracked defaultColumns = DEFAULT_COLUMNS;
  @tracked routeName = 'urgent';
}
