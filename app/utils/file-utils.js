import { ajax } from 'frontend-kaleidos/utils/ajax';

export const downloadFilePrompt = function(context, file, filename) {
  const newfilename = filename || file.get('filename');
  return ajax(`/files/${file.id}/download`, {
    method: 'GET',
    dataType: 'blob',
  }).then((content) => context.saveFileAs(newfilename, content, file.get('contentType')));
};

export const removeFile = function(file) {
  return ajax({
    method: 'DELETE',
    url: `/files/${file.id}`,
  });
};
