import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * @param loading {Boolean}
 * @param content {Array<Model>} Array of rows that will be displayed in the table
 * @param page {number} The current page
 * @param size {number} The current page size
 * @param numberOfItems {number} The number of items on this page (less than or equal to the page size)
 * @param totalNumberOfItems {number} The total number of items that we're paginating
 * @param loadingMessage {string} Optional. Message to display while content is loading
 * @param noDataMessage {string} Optional. Message to display when there is no content to display
 * @param enablePagination {Boolean} Default true, whether to enable pagination controls
 * @param onChangeSize {Function} Action to execute when changing the page size
 * @param onChangePage {Function} Action to execute when changing the page
 */
export default class KDataTableComponent extends Component {
  @service intl;

  get loadingMessage() {
    return this.args.loadingMessage ?? this.intl.t('loading');
  }

  get noDataMessage() {
    return this.args.noDataMessage ?? this.intl.t('no-results-found');
  }

  get enablePagination() {
    return this.args.enablePagination ?? true;
  }

  @action
  onNextPage() {
    this.args.onChangePage(this.args.page + 1);
  }

  @action
  onPreviousPage() {
    this.args.onChangePage(this.args.page - 1);
  }
}
