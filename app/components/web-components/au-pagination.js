
import {
  get, action
} from '@ember/object';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';

export default class AuPagination extends Component {
  @tracked pageOffset = 0;
  @tracked total = null;
  @tracked page = null;
  @tracked size = null;
  @tracked nbOfItems = null;

  @tracked currentPage = alias('page');
  @tracked firstPage = alias('pageOffset');

  disabledNext() {
    return this.isLastPage();
  }

  disabledPrev() {
    return this.isFirstPage();
  }

  totalNbOfItems() {
    if (!get(this, 'total')) {
      return 0;
    }
    return get(this, 'total');
  }

  lastPage() {
    return Math.ceil(this.total / this.size) - 1;
  }

  isFirstPage() {
    return this.firstPage === this.currentPage;
  }

  isLastPage() {
    return this.lastPage() === this.currentPage;
  }

  hasMultiplePages() {
    return this.lastPage() > 0;
  }

  startItem() {
    if (this.nbOfItems === 0) {
      return 0;
    }
    return (this.size * this.currentPage) + 1;
  }

  endItem() {
    if (this.nbOfItems === 0) {
      return 0;
    }
    return (this.startItem() + this.nbOfItems) - 1;
  }

  @action
  nextPage() {
    this.nextAction();
  }

  @action
  prevPage() {
    this.previousAction();
  }
}

