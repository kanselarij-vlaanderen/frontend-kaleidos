export default function getPaginationMetadata(pageNumber, size, total) {
  const pagination = {};

  pagination.first = {
    number: 0, size,
  };

  const lastPageNumber = total % size === 0 ? Math.floor(total / size) - 1 : Math.floor(total / size);
  const lastPageSize = total % size === 0 ? size : total % size;
  pagination.last = {
    number: lastPageNumber, size: lastPageSize,
  };

  pagination.self = {
    number: pageNumber, size,
  };

  if (pageNumber > 0) {
    pagination.prev = {
      number: pageNumber - 1, size,
    };
  }

  if (pageNumber < lastPageNumber) {
    const nextPageSize = pageNumber + 1 === lastPageNumber ? lastPageSize : size;
    pagination.next = {
      number: pageNumber + 1, size: nextPageSize,
    };
  }

  return pagination;
}
