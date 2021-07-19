import { tracked } from '@glimmer/tracking';

class PublicationFilter {
  @tracked ministerFilterOption = true;
  @tracked notMinisterFilterOption = true;
  @tracked publishedFilterOption = true;
  @tracked toPublishFilterOption = true;
  @tracked pausedFilterOption = true;
  @tracked withdrawnFilterOption = true;

  constructor(options) {
    for (const key of Object.keys(options)) {
      this[key] = options[key];
    }
  }

  reset() {
    this.ministerFilterOption = true;
    this.notMinisterFilterOption = true;
    this.publishedFilterOption = true;
    this.toPublishFilterOption = true;
    this.pausedFilterOption = true;
    this.withdrawnFilterOption = true;
  }

  clone() {
    return new PublicationFilter(this.toObject());
  }

  toString() {
    return JSON.stringify(this.toObject());
  }

  /**
   * @private
   */
  toObject() {
    return {
      ministerFilterOption: this.ministerFilterOption,
      notMinisterFilterOption: this.notMinisterFilterOption,
      publishedFilterOption: this.publishedFilterOption,
      toPublishFilterOption: this.toPublishFilterOption,
      pausedFilterOption: this.pausedFilterOption,
      withdrawnFilterOption: this.withdrawnFilterOption,
    };
  }

  get isFiltered() {
    return !this.ministerFilterOption
      || !this.notMinisterFilterOption
      || !this.pausedFilterOption
      || !this.publishedFilterOption
      || !this.toPublishFilterOption
      || !this.withdrawnFilterOption;
  }
}

export default PublicationFilter;
