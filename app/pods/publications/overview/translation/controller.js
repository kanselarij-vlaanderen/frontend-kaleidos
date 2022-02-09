import PublicationsOverviewBaseController from '../_base/controller';

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
  defaultColumns = DEFAULT_COLUMNS;
  routeName = 'translation';
}
