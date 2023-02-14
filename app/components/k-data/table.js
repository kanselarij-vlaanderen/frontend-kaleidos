import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * @param hoverable {Boolean} Whether the table rows will change colour when hovered over
 * @param striped {Boolean} Whether the table rows will alternate colour, like a zebra's stripes
 * @param stickyHeader {Boolean} Whether the table header will stick to the page view when vertically scrolling
 * @param stickyActionColumn {Boolean} Whether the rightmost action column will stick to the page view when horizontally scrolling
 * @param clickable {Boolean} Whether the rows are clickable. Overrides an undefined onClickRow parameter to still make the row look clickable, but binds no action to clicking the row
 * @param loading {Boolean}
 * @param content {Array<Model>} Array of rows that will be displayed in the table
 * @param loadingMessage {string} Optional. Message to display while content is loading
 * @param noDataMessage {string} Optional. Message to display when there is no content to display
 * @param onClickRow {Function} Optional action to execute when clicking on the row. When non-null, the rows are displayed as clickable
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
