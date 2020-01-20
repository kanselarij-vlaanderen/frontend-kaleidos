import fetch from 'fetch';
import getPaginationMetadata from './get-pagination-metadata';
import ArrayProxy from '@ember/array/proxy';
import { A } from '@ember/array';

function sortOrder(sort) {
  if (sort.startsWith('-')) {
    return 'desc';
  } else if (sort.length > 0) {
    return 'asc';
  } else {
    return null;
  }
}

function stripSort(sort) {
  return sort.replace(/(^\+)|(^-)/g, '');
}

function snakeToCamel(s){
  return s.replace(/(-\w)/g, function(m){return m[1].toUpperCase();});
}

async function muSearch(index, page, size, sort, filter, dataMapping) {
  let endpoint = `/${index}/search?page[size]=${size}&page[number]=${page}`;
  endpoint += '&collapse_uuids=t';

  for (let field in filter) {
    endpoint += `&filter[${field}]=${filter[field]}`;
  }

  if (sort) {
    endpoint += `&sort[${snakeToCamel(stripSort(sort))}]=${sortOrder(sort)}`;
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
