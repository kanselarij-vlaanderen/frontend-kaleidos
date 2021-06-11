import Component from '@glimmer/component';

/**
 *
 * @argument {Number} page: Current page number
 * @argument {Number} size: Page size
 * @argument {Number} nbOfItems: Number of items in the current result-set
 * @argument {Number} total: Total amount of items (over all pages)
 * @argument {Funtion} onNextPage: action fired when clicking 'next page'
 * @argument {Funtion} onPreviousPage: action fired when clicking 'previous page'
 */
export default class Pagination extends Component {
  firstPage = 0; // currently not configurable

  get currentPage() {
    return this.args.page;
  }

  get totalNbOfItems() {
    return this.args.total ? this.args.total : 0;
  }

  get lastPage() {
    return Math.ceil(this.args.total / this.args.size) - 1;
  }

  get isFirstPage() {
    return this.firstPage === this.currentPage;
  }

  get isLastPage() {
    return this.lastPage === this.currentPage;
  }

  get hasMultiplePages() {
    return this.lastPage > 0;
  }

  get startItem() {
    if (this.args.nbOfItems === 0) {
      return 0;
    }
    return (this.args.size * this.currentPage) + 1;
  }

  get endItem() {
    if (this.args.nbOfItems === 0) {
      return 0;
    }
    return (this.startItem + this.args.nbOfItems) - 1;
  }
}
