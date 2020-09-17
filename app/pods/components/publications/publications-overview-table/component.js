import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationsOverviewTable extends Component {
  @tracked pageSize = 10;
  @tracked currentPage = 0;

  get pageStart() {
    return (this.currentPage * this.pageSize) + 1;
  }

  get pageEnd() {
    const calculatedEnd = this.pageStart + this.pageSize - 1;

    if (calculatedEnd > this.args.data.length) {
      return this.args.data.length;
    }

    return calculatedEnd;
  }

  get prevPageButtonDisabled() {
    return this.currentPage === 0;
  }

  get nextPageButtonDisabled() {
    return this.pageEnd >= this.args.data.length;
  }

  get publicationsForCurrentPage() {
    const startIndex = this.pageStart - 1;
    const endIndex = this.pageEnd;
    return this.args.data.slice(startIndex, endIndex);
  }

  @action
  handlePrevPage() {
    if (!this.prevPageButtonDisabled) {
      this.currentPage = this.currentPage - 1;
    }
  }

  @action
  handleNextPage() {
    if (!this.nextPageButtonDisabled) {
      this.currentPage = this.currentPage + 1;
    }
  }
}
