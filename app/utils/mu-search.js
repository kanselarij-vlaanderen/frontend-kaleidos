import fetch from 'fetch';
import ArrayProxy from '@ember/array/proxy';
import getPaginationMetadata from './get-pagination-metadata';

function sortOrder(sort) {
  if (sort.startsWith('-')) {
    return 'desc';
  }
  if (sort.length > 0) {
    return 'asc';
  }
  return null;
}

function stripSort(sort) {
  return sort.replace(/(^\+)|(^-)/g, '');
}

function snakeToCamel(text) {
  return text.replace(/(-\w)/g, (entry) => entry[1].toUpperCase());
}

async function muSearch(
  index,
  page,
  size,
  sort,
  filter,
  dataMapping,
  highlightConfig
) {
  const endpoint = new URL(`/${index}/search`, window.location.origin);
  const params = new URLSearchParams(
    Object.entries({
      'page[size]': size,
      'page[number]': page,
      // eslint-disable-next-line camelcase
      collapse_uuids: 't',
    })
  );

  for (const field in filter) {
    params.append(`filter[${field}]`, filter[field]);
  }

  if (sort) {
    params.append(`sort[${snakeToCamel(stripSort(sort))}]`, sortOrder(sort));
  }

  if (highlightConfig) {
    if (highlightConfig.fields) {
      params.append(`highlight[:fields:]`, highlightConfig.fields.join(','));
    }

    if (highlightConfig.tag) {
      params.append('highlight[:tag:]', highlightConfig.tag);
    }
  }

  endpoint.search = params.toString();

  const { count, data } = await (await fetch(endpoint)).json();
  const pagination = getPaginationMetadata(page, size, count);
  const entries = await Promise.all(data.map(dataMapping));

  return ArrayProxy.create({
    content: entries.slice(),
    highlight: data.map((entry) => entry.highlight),
    meta: {
      count,
      pagination,
    },
  });
}

export default muSearch;
