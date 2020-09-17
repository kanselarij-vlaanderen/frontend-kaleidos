import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PublicationsInProgressController extends Controller {
  @tracked pageSize = 10;
  @tracked currentPage = 0;

  get pageStart() {
    return (this.currentPage * this.pageSize) + 1;
  }

  get pageEnd() {
    const calculatedEnd = this.pageStart + this.pageSize - 1;

    if (calculatedEnd > this.publicationsInProgress.length) {
      return this.publicationsInProgress.length;
    }

    return calculatedEnd;
  }

  get prevPageButtonDisabled() {
    return this.currentPage === 0;
  }

  get nextPageButtonDisabled() {
    return this.pageEnd >= this.publicationsInProgress.length;
  }

  get publicationsInProgress() {
    if (this.model) {
      return this.model.filter((publication) => publication.inProgress);
    }

    return [];
  }

  get publicationsForCurrentPage() {
    const startIndex = this.pageStart - 1;
    const endIndex = this.pageEnd;
    return this.publicationsInProgress.slice(startIndex, endIndex);
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
