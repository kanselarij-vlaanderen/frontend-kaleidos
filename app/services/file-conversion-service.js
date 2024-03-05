import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';
import {
  DOCUMENT_CONVERSION_SUPPORTED_MIME_TYPES,
} from 'frontend-kaleidos/config/config';

export default class FileConversionService extends Service {
  @service store;

  async convertSourceFile(sourceFile) {
    if (DOCUMENT_CONVERSION_SUPPORTED_MIME_TYPES.some((mimeType) => sourceFile.format.includes(mimeType))) {
      const oldDerivedFile = await sourceFile.derived;
      if (oldDerivedFile) {
        // if derived file exists we keep it. Generated PDF is not yet correct for users
        return;
      }
      const response = await fetch(`/files/${sourceFile.id}/convert`, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
      });

      if (response.ok) {
        if (oldDerivedFile) {
          oldDerivedFile.source = null;
          await oldDerivedFile.save();
          await oldDerivedFile.destroyRecord();
        }
        const result = await response.json();
        const derivedFile = await this.store.findRecord('file', result.data[0].id)
        sourceFile.derived = derivedFile;
        await sourceFile.save();
      } else {
        console.warn(`Couldn't convert file with id ${sourceFile.id}`);
        let errorMessage = response.status;
        if (response.headers.get('Content-Type') === 'application/vnd.api+json') {
          const { errors } = await response.json();
          errorMessage = JSON.stringify(errors);
        }
        throw new Error(`An exception occurred while converting a file: ${errorMessage}`);
      }
    }
  }
}
