import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { warn } from '@ember/debug';
import { sortDocuments } from 'fe-redpencil/utils/documents';

const batchSize = 20;

class DocumentHistory {
  /**
   * Document container to show the document history for
  */
  @tracked documentContainer
  /**
   * Document until which the document history of the container should be shown
  */
  @tracked lastDocument
}

export default class DocumentList extends Component {
  @service store;
  @service fileService;

  @tracked documentHistories = A([]);

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get sortedDocumentHistories() {
    const containers = this.documentHistories.map((history) => history.documentContainer);
    const documents = this.documentHistories.map((history) => history.lastDocument);
    const sortedContainers = sortDocuments(documents, containers);
    const sortedHistories = A([]);
    for (const container of sortedContainers) {
      const history = this.documentHistories.find((history) => history.documentContainer.get('id') == container.get('id'));
      sortedHistories.pushObject(history);
    }
    return sortedHistories;
  }

  @task
  *loadData() {
    const documents = yield this.args.documents;
    const documentIds = documents.map((document) => document.get('id'));

    // Get a list of unique document containers of the documents
    const uniqueDocumentContainers = new Set();
    for (let idx = 0; idx < documents.length; idx = idx + batchSize) {
      const batch = documentIds.slice(idx, idx + batchSize);
      const documentContainers = yield this.store.query('document', {
        'filter[documents][id]': batch.join(','),
        include: 'type,documents.access-level,documents.previous-version,documents.next-version',
        page: {
          size: batch.length,
        },
      });
      documentContainers.forEach((container) => uniqueDocumentContainers.add(container));
    }

    // For each document container, determine the lastest version to display
    this.documentHistories = yield all([...uniqueDocumentContainers].map((container) => this.createDocumentHistory.perform(container, documents)));
  }

  @task
  *createDocumentHistory(documentContainer, allDocuments) {
    const history = new DocumentHistory();
    history.documentContainer = documentContainer;

    const containerDocuments = yield documentContainer.documents;

    const heads = [];
    for (const document of containerDocuments.toArray()) {
      const previousDocument = yield document.previousVersion;
      if (!previousDocument) {
        heads.push(document);
      }
    }

    let sortedContainerDocuments = [];
    if (heads.length > 1) {
      warn('More than 1 possible head found for linked list of documents. Falling back to sort by document creation date', {
        id: 'multiple-possible-linked-list-heads',
      });
      sortedContainerDocuments = containerDocuments.sortBy('created');
    } else {
      let next = heads[0];
      while (next) {
        sortedContainerDocuments.push(next);
        next = yield next.nextVersion;
      }
    }

    // Loop over the reverse sorted documents and find the latest version that is also included
    // in all documents.
    const reverseSortedContainerDocuments = sortedContainerDocuments.slice(0).reverse();
    for (const document of reverseSortedContainerDocuments) {
      const matchingDocument = allDocuments.find((doc) => doc.get('id') === document.get('id'));
      if (matchingDocument) {
        history.lastDocument = matchingDocument;
        break;
      }
    }

    return history;
  }


  @task
  *saveEditDocuments() {
    const updatePromises = this.documentHistories.map(async(history) => {
      if (history.lastDocument.softDeleted) {
        this.fileService.deleteDocument(history.documentContainer);
      } else {
        await history.lastDocument.save();
        await history.documentContainer.save();
      }
    });
    yield all(updatePromises);
    this.args.onCloseEdit();
  }

  @task
  *cancelEditDocuments() {
    const rollbacks = this.documentHistories.map(async(history) => {
      history.lastDocument.set('softDeleted', false);
      history.lastDocument.rollbackAttributes();
      await history.lastDocument.belongsTo('accessLevel').reload();
      history.documentContainer.rollbackAttributes();
      history.documentContainer.belongsTo('type').reload();
    });
    yield all(rollbacks);
    this.args.onCloseEdit();
  }
}
