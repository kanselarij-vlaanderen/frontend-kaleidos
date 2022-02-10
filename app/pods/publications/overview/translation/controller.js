import PublicationsOverviewBaseController from '../_base/controller';
import { tracked } from '@glimmer/tracking';

const DEFAULT_COLUMNS = [
  'isUrgent',
  'publicationNumber',
  'shortTitle',
  'pageCount',
  'translationRequestDate',
  'translationDueDate',
  'publicationDueDate',
];

export default class PublicationsOverviewTranslationController extends PublicationsOverviewBaseController {
  @tracked defaultColumns = DEFAULT_COLUMNS;
  @tracked routeName = 'translation';
}
