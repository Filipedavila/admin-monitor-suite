import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook that wraps useState for checkbox selections
 * and ensures uniqueness by a specified key (default: 'id').
 * 
 * This is a workaround for Issue #64 where the SortingTable component
 * may select multiple items with the same value in non-unique fields (like Uri).
 * 
 * The hook ensures that:
 * 1. Only items with valid unique keys are accepted
 * 2. Duplicate items (by key) are automatically removed
 * 3. The selection is always an array of unique items
 * 
 * @param {Array} initialValue - Initial selection array
 * @param {string} uniqueKey - The key to use for uniqueness check (default: 'id')
 * @returns {[Array, Function]} - The selection array and a setter function
 */
export const useUniqueCheckboxSelection = (initialValue = [], uniqueKey = 'id') => {
  const [selection, setSelectionInternal] = useState(initialValue);
  const lastValidSelection = useRef(initialValue);
  
  /**
   * Deduplicate an array by a specific key
   */
  const deduplicateByKey = useCallback((items) => {
    if (!Array.isArray(items)) return [];
    
    const seen = new Set();
    const result = [];
    
    for (const item of items) {
      // Skip items without a valid key
      if (!item || item[uniqueKey] === undefined || item[uniqueKey] === null) {
        continue;
      }
      
      const key = item[uniqueKey];
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
    
    return result;
  }, [uniqueKey]);
  
  const setSelection = useCallback((newSelection) => {
    if (typeof newSelection === 'function') {
      setSelectionInternal(prev => {
        const result = newSelection(prev);
        const deduplicated = deduplicateByKey(result);
        lastValidSelection.current = deduplicated;
        return deduplicated;
      });
    } else {
      const deduplicated = deduplicateByKey(newSelection);
      lastValidSelection.current = deduplicated;
      setSelectionInternal(deduplicated);
    }
  }, [deduplicateByKey]);
  
  // Ensure selection is always valid
  useEffect(() => {
    const deduplicated = deduplicateByKey(selection);
    if (deduplicated.length !== selection.length) {
      setSelectionInternal(deduplicated);
    }
  }, [selection, deduplicateByKey]);
  
  return [selection, setSelection];
};

export default useUniqueCheckboxSelection;

