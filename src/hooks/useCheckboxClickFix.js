import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook to fix Issue #64 - Checkbox selection for duplicate items
 * 
 * The SortingTable component from ama-design-system may select multiple
 * checkboxes when items have duplicate values in certain fields.
 * 
 * This hook intercepts checkbox clicks and ensures only the clicked
 * checkbox is affected, using the row's unique ID.
 * 
 * @param {Function} setCheckboxesSelected - The setter function for selected items
 * @param {Array} data - The data array passed to the table
 * @param {string} uniqueKey - The unique key field (default: 'id')
 * @param {string} tableSelector - CSS selector to identify the table (optional)
 */
export const useCheckboxClickFix = (
  setCheckboxesSelected,
  data,
  uniqueKey = 'id',
  tableSelector = '.ama-sorting-table'
) => {
  const lastClickedRow = useRef(null);
  
  const handleCheckboxChange = useCallback((event) => {
    const checkbox = event.target;
    if (checkbox.type !== 'checkbox') return;
    
    // Find the row this checkbox belongs to
    const row = checkbox.closest('tr');
    if (!row) return;
    
    // Get row index (excluding header rows)
    const tbody = row.closest('tbody');
    if (!tbody) return;
    
    const rowIndex = Array.from(tbody.querySelectorAll('tr')).indexOf(row);
    if (rowIndex < 0 || rowIndex >= data.length) return;
    
    // Get the item data for this row
    const item = data[rowIndex];
    if (!item || !item[uniqueKey]) return;
    
    const itemId = item[uniqueKey];
    
    // Store the clicked row info
    lastClickedRow.current = {
      id: itemId,
      checked: checkbox.checked,
      timestamp: Date.now()
    };
    
    // Use setTimeout to run after the SortingTable's own handler
    setTimeout(() => {
      setCheckboxesSelected(prev => {
        if (checkbox.checked) {
          // Add the item if not already present
          const exists = prev.some(p => p[uniqueKey] === itemId);
          if (!exists) {
            return [...prev, item];
          }
          return prev;
        } else {
          // Remove the item
          return prev.filter(p => p[uniqueKey] !== itemId);
        }
      });
    }, 0);
  }, [data, uniqueKey, setCheckboxesSelected]);
  
  useEffect(() => {
    const table = document.querySelector(tableSelector);
    if (!table) return;
    
    // Add listener to tbody checkboxes
    const tbody = table.querySelector('tbody');
    if (tbody) {
      tbody.addEventListener('change', handleCheckboxChange, true);
    }
    
    return () => {
      if (tbody) {
        tbody.removeEventListener('change', handleCheckboxChange, true);
      }
    };
  }, [tableSelector, handleCheckboxChange]);
  
  return { lastClickedRow };
};

export default useCheckboxClickFix;
