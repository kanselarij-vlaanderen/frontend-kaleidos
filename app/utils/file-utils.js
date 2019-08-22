import $ from 'jquery';

export const downloadFilePrompt = function (file, filename) {
  filename = filename || file.get('filename');
  return $.ajax(`/files/${file.id}/download`, {
    method: 'GET',
    dataType: 'blob',
    processData: false
  })
    .then((content) => this.saveFileAs(filename, content, file.get('contentType')));
};

export const removeFile = function(file) {
  return $.ajax({
    method: "DELETE",
    url: '/files/' + file.id
  });
};
