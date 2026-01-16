import { useEffect } from 'react';

/**
 * Hook to fix accessibility issues in ama-design-system SortingTable component.
 * 
 * Issue #68 fixes:
 * 1. Screen readers not seeing tbody rows - Fixed via CSS in index.css
 * 2. "All" checkbox being checked by default - Fixed by this hook
 * 3. Screen readers skipping first data row - Fixed by changing nRow: 2 to nRow: 1
 *    in table.config.jsx files (for tables with single-row headers)
 * 
 * @param {Array} dependencies - Dependencies to trigger the fix (e.g., data updates)
 */
export const useTableAccessibilityFix = (dependencies = []) => {
  useEffect(() => {
    // Fix for Issue #68: Remove default checked attribute from header checkbox
    // The ama-design-system has a bug where the "All" checkbox is checked by default
    const fixHeaderCheckbox = () => {
      const headerCheckboxes = document.querySelectorAll('thead input[type="checkbox"]');
      headerCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.removeAttribute('checked');
      });
    };
    
    // Run fix after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(fixHeaderCheckbox, 100);
    
    return () => clearTimeout(timeoutId);
  }, dependencies);
};

/**
 * Hook specifically for fixing the header checkbox state after data changes.
 * Should be called when the table data is loaded or refreshed.
 * 
 * @param {Array} data - The table data array, used as dependency
 */
export const useTableCheckboxFix = (data) => {
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const fixHeaderCheckbox = () => {
      const headerCheckboxes = document.querySelectorAll('thead input[type="checkbox"]');
      headerCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.removeAttribute('checked');
      });
    };
    
    // Run fix after DOM update
    const timeoutId = setTimeout(fixHeaderCheckbox, 50);
    
    return () => clearTimeout(timeoutId);
  }, [data]);
};

export default useTableAccessibilityFix;
