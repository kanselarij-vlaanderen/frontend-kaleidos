import Controller from '@ember/controller';

export default class PublicationTranslationController extends Controller {
  get subcases() {
    const subcases = this.model.subcases.map((subcase) => subcase);
    return subcases;
  }
}
