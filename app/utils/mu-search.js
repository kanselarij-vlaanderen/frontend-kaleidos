import fetch from 'fetch';
import getPaginationMetadata from './get-pagination-metadata';
import ArrayProxy from '@ember/array/proxy';
import { A } from '@ember/array';

async function muSearch(index, page, size, filter, dataMapping) {
  let endpoint = `/${index}/search?page[size]=${size}&page[number]=${page}`;

  for (let field in filter) {
    endpoint += `&filter[${field}]=${filter[field]}`;
  }

  const { count, data } = await (await fetch(endpoint)).json();
  const pagination = getPaginationMetadata(page, size, count);
  const entries = A(data.map(dataMapping));

  return ArrayProxy.create({
    content: entries,
    meta: { count, pagination }
  });
}

export default muSearch;
