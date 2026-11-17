import { useCallback, useMemo, useState } from "react";

// Backend maximum pagination limit (PAGINATION_MAX_LIMIT in monitor-server)
export const MAX_ITEMS_PER_PAGE = 100;

const NON_SORTING_TYPE = {
  SortingText: "Text",
  SortingDate: "Text",
  SortingIcon: "Icon",
};

/**
 * Keeps only the sortable headers whose property the backend can sort by
 * (present in fieldMap); the others are rendered as plain headers.
 */
export const toServerSortHeaders = (headers, fieldMap) => {
  const convert = (header) =>
    NON_SORTING_TYPE[header.type] && !fieldMap[header.property]
      ? { ...header, type: NON_SORTING_TYPE[header.type] }
      : header;
  return headers.map((row) => (Array.isArray(row) ? row.map(convert) : convert(row)));
};

/**
 * Server-side sorting state for SortingTable lists.
 * fieldMap maps table column properties to backend sort fields, e.g. { Short_Name: "shortName" }.
 * `sorts` is sent in the query string as sorts[field]=ASC|DESC (qs.stringify).
 */
export const useServerSort = (fieldMap, onSortApplied) => {
  const [sorts, setSorts] = useState(undefined);

  const onSortChange = useCallback(
    (property, direction) => {
      const field = fieldMap[property];
      if (!field) return;
      setSorts({ [field]: direction.toUpperCase() });
      if (onSortApplied) onSortApplied();
    },
    [fieldMap, onSortApplied]
  );

  const sortHeaders = useCallback((headers) => toServerSortHeaders(headers, fieldMap), [fieldMap]);

  return useMemo(() => ({ sorts, onSortChange, sortHeaders }), [sorts, onSortChange, sortHeaders]);
};
