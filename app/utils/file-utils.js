import { ajax } from 'fe-redpencil/utils/ajax';

export const downloadFilePrompt = function(context, file, filename) {
  filename = filename || file.get('filename');
  return ajax(`/files/${file.id}/download`, {
    method: 'GET',
    dataType: 'blob',
  }).then((content) => context.saveFileAs(filename, content, file.get('contentType')));
};

export const removeFile = function(file) {
  return ajax({
    method: 'DELETE',
    url: `/files/${file.id}`,
  });
};
