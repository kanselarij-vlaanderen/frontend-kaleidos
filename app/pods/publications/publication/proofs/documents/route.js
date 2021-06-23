import Route from '@ember/routing/route';
import { dasherize } from '@ember/string';

export default class PublicationsPublicationProofsDocumentsRoute extends Route {
  async generateTestData(pubSubcase) {
    // TODO: remove test data
    // six pieces must be already uploaded
    await Promise.all([
      ...pubSubcase.sourceDocuments.map(async(piece) => {
        piece.publicationSubcase = undefined;
        await piece.save();
      }),
      ...pubSubcase.proofingActivities.map((activity) => activity.destroy()),
      ...pubSubcase.publicationActivities.map((activity) => activity.destroy())
    ]);

    // return;
    let pieces = await this.store.query('piece', {
      include: 'file',
      'page[size]': 200,
      sort: 'created,name',
    });
    pieces = pieces.toArray();
    if (pieces.length < 6) {
      alert('Upload 6 pieces then I will generate test data.');
      return;
    }

    pubSubcase.sourceDocuments.pushObjects([pieces[0], pieces[1]]);
    await pubSubcase.save();

    const proofing1 = this.store.createRecord('proofing-activity', {
      title: 'Proefdrukactiviteit 1',
      startDate: new Date('2021-06-17'),
      endDate: new Date('2021-06-17'),
      subcase: pubSubcase,
    });
    // const proofing1 = pubSubcase.proofingActivities.objectAt(0);
    proofing1.generatedPieces.pushObject(pieces[2]);
    await proofing1.save();

    const proofing2 = this.store.createRecord('proofing-activity', {
      title: 'Proefdrukactiviteit 1',
      startDate: new Date('2021-07-12'),
      endDate: new Date('2021-07-12'),
      subcase: pubSubcase,
    });
    // const proofing2 = pubSubcase.proofingActivities.objectAt(1);
    proofing2.generatedPieces.pushObject(pieces[3]);
    await proofing2.save();

    const publication1 = this.store.createRecord('publication-activity', {
      title: 'Publicatieactiviteit 1',
      startDate: new Date('2021-08-22'),
      endDate: new Date('2021-08-22'),
      subcase: pubSubcase,
    });
    // const publication1 = pubSubcase.publicationActivities.objectAt(0)
    publication1.generatedPieces.pushObject(pieces[4]);
    await publication1.save();

    const publication2 = this.store.createRecord('publication-activity', {
      title: 'Publicatieactiviteit 2',
      startDate: new Date('2021-08-22'),
      endDate: new Date('2021-08-22'),
      subcase: pubSubcase,
    });
    // const publication2 = pubSubcase.publicationActivities.objectAt(1)
    publication2.generatedPieces.pushObject(pieces[5]);
    await publication2.save();

    for (let index = 0; index < 6; ++index) {
      const piece = pieces[index];
      await piece.save();
    }
  }

  async model() {
    const publicationSubcaseFromParentRoute = this.modelFor('publications.publication.proofs');

    // await this.generateTestData(publicationSubcaseFromParentRoute);

    const pieceInclude = {
      file: true,
    };
    const includes = {
      sourceDocuments: pieceInclude,
      proofingActivities: {
        generatedPieces: pieceInclude,
      },
      publicationActivities: {
        generatedPieces: pieceInclude,
      },
    };
    const includeString = buildIncludeString(includes);
    // findRecord 'include' does not work
    const publicationSubcase = await this.store.queryOne('publication-subcase', {
      'filter[:id:]': publicationSubcaseFromParentRoute.id,
      include: includeString,
    });

    return publicationSubcase;
  }

  async afterModel(model) {
    // publicationSubcase.publicationFlow causes network request while, but the request is already made in 'publications.publication'
    this.publicationFlow = this.modelFor('publications.publication');
    this.publicationSubcase = model;
  }

  async setupController(controller, model) {
    super.setupController(...arguments);

    controller.publicationSubcase = this.publicationSubcase;
    controller.publicationFlow = this.publicationFlow;
    controller.initRows(model);
    controller.isOpenRequestModal = false;
  }
}

function buildIncludeString(includeObject) {
  const builder = [];
  function buildIncludeStringForRelation(includeObject, propertyPath) {
    for (const childKey in includeObject) {
      const childPropertyVal = includeObject[childKey];
      if (!childPropertyVal) {
        continue;
      }

      const childKeyDasherized = dasherize(childKey);
      let childPropertyPath;
      if (propertyPath) {
        childPropertyPath = `${propertyPath}.${childKeyDasherized}`;
      } else {
        childPropertyPath = childKeyDasherized;
      }
      builder.push(childPropertyPath);

      if (typeof childPropertyVal === 'object') {
        buildIncludeStringForRelation(childPropertyVal, childPropertyPath);
      }
    }
  }
  buildIncludeStringForRelation(includeObject);

  const includeString = builder.join(',');
  return includeString;
}
