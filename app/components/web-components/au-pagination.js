import Component from '@glimmer/component';
import { action } from '@ember/object';
export default class AuPagination extends Component {
  currentPage= this.args.page;
  firstPage= 0;

  get totalNbOfItems() {
    if (!this.args.total) {
      return 0;
    }
    return this.args.total;
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
    this.args.nextAction();
  }

  @action
  prevPage() {
    this.args.previousAction();
  }
}
