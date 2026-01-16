import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to visually fix duplicate checkbox selection in SortingTable.
 * 
 * Issue #64: When pages have duplicate URIs, selecting one checkbox
 * may visually select multiple checkboxes because the SortingTable
 * component uses some field (like URI) for checkbox identification.
 * 
 * This hook monitors checkbox changes and ensures only the correctly
 * selected checkboxes (based on the actual selection array) are visible.
 * 
 * @param {Array} checkboxesSelected - The selected items array
 * @param {Array} data - The data array passed to the table
 * @param {string} uniqueKey - The unique key field (default: 'id')
 * @param {string} containerSelector - CSS selector for the table container
 */
export const useSyncCheckboxVisuals = (
  checkboxesSelected,
  data,
  uniqueKey = 'id',
  containerSelector = 'table'
) => {
  const syncTimeoutRef = useRef(null);
  
  const syncCheckboxes = useCallback(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const tbody = container.querySelector('tbody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    const selectedIds = new Set(checkboxesSelected.map(item => item[uniqueKey]));
    
    rows.forEach((row, index) => {
      const checkbox = row.querySelector('input[type="checkbox"]');
      if (!checkbox) return;
      
      const item = data[index];
      if (!item) return;
      
      const itemId = item[uniqueKey];
      const shouldBeChecked = selectedIds.has(itemId);
      
      // Only update if there's a mismatch
      if (checkbox.checked !== shouldBeChecked) {
        checkbox.checked = shouldBeChecked;
      }
    });
  }, [checkboxesSelected, data, uniqueKey, containerSelector]);
  
  // Sync checkboxes after selection changes
  useEffect(() => {
    // Clear any pending sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    // Schedule sync after React has finished rendering
    syncTimeoutRef.current = setTimeout(syncCheckboxes, 50);
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [checkboxesSelected, syncCheckboxes]);
  
  // Also sync when data changes
  useEffect(() => {
    syncCheckboxes();
  }, [data, syncCheckboxes]);
  
  return { syncCheckboxes };
};

export default useSyncCheckboxVisuals;
