import { tracked } from '@glimmer/tracking';

class PublicationFilter {
  @tracked ministerFilterOption = false;
  @tracked notMinisterFilterOption = true;
  @tracked publishedFilterOption = false;
  @tracked toPublishFilterOption = true;
  @tracked pausedFilterOption = true;
  @tracked withdrawnFilterOption = true;

  constructor(options) {
    for (let key of Object.keys(options)) {
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
}

export default PublicationFilter;
