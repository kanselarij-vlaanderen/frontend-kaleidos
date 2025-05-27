import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';
import {
  DOCUMENT_CONVERSION_SUPPORTED_EXTENSIONS,
  DOCUMENT_CONVERSION_SUPPORTED_MIME_TYPES,
} from 'frontend-kaleidos/config/config';

export default class FileConversionService extends Service {
  @service store;
  @service toaster;
  @service intl;

  canConvertSourceFile(sourceFile) {
    if (!sourceFile?.extension) {
      return false;
    }
    return (
      DOCUMENT_CONVERSION_SUPPORTED_MIME_TYPES.some((mimeType) =>
        sourceFile.format.includes(mimeType),
      ) &&
      DOCUMENT_CONVERSION_SUPPORTED_EXTENSIONS.includes(sourceFile.extension)
    );
  }

  async convertSourceFile(sourceFile, showFullProgress) {
    let convertToast;
    if (this.canConvertSourceFile(sourceFile)) {
      try {
        const oldDerivedFile = await sourceFile.derived;
        if (showFullProgress) {
          convertToast = this.toaster.loading(
            this.intl.t('document-being-converted'),
            null,
            {
              timeOut: 60000,
              closable: false,
            }
          );
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
          const modelName = sourceFile.constructor.modelName;
          const derivedFile = await this.store.findRecord(modelName, result.data[0].id);
          sourceFile.derived = derivedFile;
          await sourceFile.save();
          if (showFullProgress) {
            this.toaster.success(this.intl.t('document-converted'));
          }
        } else {
          let errorMessage = this.intl.t('document-failed-to-convert', {name: sourceFile.filename});
          if (response.headers.get('Content-Type').includes('application/vnd.api+json')) {
            const { errors } = await response.json();
            errorMessage += JSON.stringify(errors);
          } else {
            // we don't get these headers when the http call times out
            errorMessage= this.intl.t('document-failed-to-convert-timed-out', {name: sourceFile.filename} )
          }
          console.warn(errorMessage);
          throw new Error(errorMessage);
        }
      } catch (error) {
        // errors are caught where this method is used and an error toast is shown
        // maybe we should only do that toast here once rather than duplicating
        console.log('Could not convert document, possibly timed out');
        throw error;
      } finally {
        if (showFullProgress) {
          this.toaster.close(convertToast);
        }
      }
    }
  }
}
