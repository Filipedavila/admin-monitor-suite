import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook to implement server-side sorting for SortingTable component.
 * 
 * Issue #60: The SortingTable component only sorts visible records (client-side).
 * This hook intercepts clicks on sortable column headers and triggers a callback
 * to reload data from the server with the correct sorting parameters.
 * 
 * @param {Function} onSortChange - Callback function(field, direction) to call when sorting changes
 * @param {string} currentSortField - Currently sorted field
 * @param {string} currentSortDirection - Current sort direction ('asc' or 'desc')
 * @param {string} tableSelector - CSS selector for the table (default: 'table')
 */
export const useServerSideSorting = (
  onSortChange,
  currentSortField = '',
  currentSortDirection = '',
  tableSelector = 'table'
) => {
  const isProcessing = useRef(false);
  
  // Map of visible column names to API field names
  const columnFieldMap = {
    'Uri': 'Uri',
    'URL': 'Uri',
    'Pontuação': 'Score',
    'Score': 'Score',
    'Data avaliação': 'Evaluation_Date',
    'Última avaliação': 'Evaluation_Date',
    'Elementos': 'Element_Count',
    'Nº Elementos': 'Element_Count',
    'A': 'A',
    'AA': 'AA',
    'AAA': 'AAA',
    'E': 'e',
    'Observatório': 'OPAW',
    'Nome': 'Name',
    'Páginas': 'Pages',
    'Data criação': 'Creation_Date',
    'Nº de páginas': 'Pages',
  };
  
  const handleHeaderClick = useCallback((event) => {
    // Prevent multiple rapid clicks
    if (isProcessing.current) return;
    
    const target = event.target;
    
    // Check if clicked element is a sortable header button
    const headerButton = target.closest('button');
    if (!headerButton) return;
    
    const th = headerButton.closest('th');
    if (!th) return;
    
    // Get the column name from the header text
    const headerText = th.textContent?.trim() || '';
    
    // Try to find the field name
    let fieldName = columnFieldMap[headerText];
    
    // If not in map, try to find by aria-label or data attribute
    if (!fieldName) {
      const ariaLabel = headerButton.getAttribute('aria-label') || '';
      for (const [key, value] of Object.entries(columnFieldMap)) {
        if (ariaLabel.includes(key)) {
          fieldName = value;
          break;
        }
      }
    }
    
    // If still not found, use the header text as-is
    if (!fieldName) {
      fieldName = headerText.replace(/[^\w]/g, '');
    }
    
    if (!fieldName || !onSortChange) return;
    
    isProcessing.current = true;
    
    // Determine new direction
    let newDirection = 'asc';
    if (currentSortField === fieldName) {
      // Toggle direction
      newDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    }
    
    // Call the callback
    onSortChange(fieldName, newDirection);
    
    // Prevent the default client-side sorting
    event.preventDefault();
    event.stopPropagation();
    
    // Reset processing flag after a short delay
    setTimeout(() => {
      isProcessing.current = false;
    }, 100);
  }, [onSortChange, currentSortField, currentSortDirection, columnFieldMap]);
  
  useEffect(() => {
    const table = document.querySelector(tableSelector);
    if (!table) return;
    
    const thead = table.querySelector('thead');
    if (!thead) return;
    
    // Add listener to thead for header clicks
    thead.addEventListener('click', handleHeaderClick, true);
    
    return () => {
      thead.removeEventListener('click', handleHeaderClick, true);
    };
  }, [tableSelector, handleHeaderClick]);
  
  return { 
    currentSortField, 
    currentSortDirection 
  };
};

export default useServerSideSorting;
