import PublicationsOverviewBaseController from '../_base/controller';
import { tracked } from '@glimmer/tracking';

const DEFAULT_COLUMNS = [
  'publicationNumber',
  'shortTitle',
  'publicationDueDate',
  'status',
];

export default class PublicationsOverviewAllController extends PublicationsOverviewBaseController {
  @tracked defaultColumns = DEFAULT_COLUMNS;
}
