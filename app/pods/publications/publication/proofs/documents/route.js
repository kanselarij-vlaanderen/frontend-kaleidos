/* eslint-disable */
import Route from '@ember/routing/route';
import { next } from '@ember/runloop';
import { dasherize } from '@ember/string';

export default class PublicationsPublicationProofsDocumentsRoute extends Route {
  async linkPieces(pubSubcase) {
    // TODO: remove temporary solution
    let pieces = await this.store.query('piece', {
      include: 'file',
      'page[size]': 200,
      sort: 'created',
    });
    pieces = pieces.toArray();

    pubSubcase.sourceDocuments.pushObjects([pieces[0], pieces[1]])

    const proofing1 = this.store.createRecord('proofing-activity', {
      title: 'Proefdrukactiviteit 1',
      startDate: new Date('2021-06-17'),
      endDate: new Date('2021-06-17'),
      subcase: pubSubcase,
    });
    proofing1.generatedPieces.pushObject(pieces[2]);

    const proofing2 = this.store.createRecord('proofing-activity', {
      title: 'Proefdrukactiviteit 1',
      startDate: new Date('2021-07-12'),
      endDate: new Date('2021-07-12'),
      subcase: pubSubcase,
    });
    proofing2.generatedPieces.pushObject(pieces[3]);

    const publication1 = this.store.createRecord('publication-activity', {
      title: 'Publicatieactiviteit 1',
      startDate: new Date('2021-08-22'),
      endDate: new Date('2021-08-22'),
      subcase: pubSubcase,
    });
    publication1.generatedPieces.pushObject(pieces[4]);

    const publication2 = this.store.createRecord('publication-activity', {
      title: 'Publicatieactiviteit 2',
      startDate: new Date('2021-08-22'),
      endDate: new Date('2021-08-22'),
      subcase: pubSubcase,
    });
    publication2.generatedPieces.pushObject(pieces[5]);
  }

  async model() {
    const pubSubcaseParent = this.modelFor('publications.publication.proofs');

    await this.linkPieces(pubSubcaseParent);

    const pieceInclude = {
      file: true,
    }
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
    let pubSubcase = await this.store.queryOne('publication-subcase', {
      'filter[:id:]': pubSubcaseParent.id,
      include: includeString,
    });

    return pubSubcase;
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.initRows(model);
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

      const childKeyDash = dasherize(childKey);
      let childPropertyPath;
      if (propertyPath) {
        childPropertyPath = `${propertyPath}.${childKeyDash}`;
      } else {
        childPropertyPath = childKeyDash;
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


async function untilIncludesLoaded(model, includeObject) {
  async function awaitIncludesForRelation(model, includeObject) {
    if (model.length !== undefined) {
      const elementPromises = model.map((submodel, i) => {
        return awaitIncludesForRelation(submodel, includeObject);
      });
      await  Promise.all(elementPromises);
    } else {
      model = await model;
      if (typeof includeObject === 'object') {
        const propertyPromises = Object.entries(includeObject).map((async([modelProperty, childInclude]) => {
          const relationship = await model[modelProperty];
          await awaitIncludesForRelation(relationship, childInclude);
        }));

        await Promise.all(propertyPromises);
      }
    }
    return model;
  }

  return awaitIncludesForRelation(model, includeObject);
}
