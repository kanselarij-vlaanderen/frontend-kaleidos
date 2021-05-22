import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class AuPagination extends Component {
  firstPage = 0;

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

  @action
  nextPage() {
    this.args.onNextPage();
  }

  @action
  prevPage() {
    this.args.onPreviousPage();
  }
}
