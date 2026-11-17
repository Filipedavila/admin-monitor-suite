import { useState, useMemo } from "react";
import { MultiSelect, SortingTable } from "@a12e/accessmonitor-ds";

/**
 * Picker + table pattern used across create/edit forms to associate a list of
 * entities (websites, users, categories, directories, ...): the MultiSelect is
 * only used to pick one/more options at a time (it always resets to empty
 * after a pick, and already-selected items are excluded from its options so
 * they can't be picked twice), and everything currently associated is shown
 * in a table below, each row with its own "Remover" button.
 *
 * `selected` is the list of currently associated items as {value, label}
 * (not just ids), so previously picked items stay visible in the table even
 * after they scroll out of the live search results in `options`.
 */
const MultiSelectTable = ({
  id,
  darkTheme,
  label,
  placeholder,
  options,
  selected,
  onSelectedChange,
  onInputChange,
  isLoading,
  noOptionsMessage,
  loadingMessage,
  isValid = true,
  columnLabel,
  tableCaption,
  emptyMessage,
}) => {
  const [pickerValue, setPickerValue] = useState([]);

  const availableOptions = useMemo(() => {
    const selectedIds = new Set((selected || []).map((item) => item.value));
    return (options || []).filter((opt) => !selectedIds.has(opt.value));
  }, [options, selected]);

  const rows = useMemo(
    () => (selected || []).map((item) => ({ id: item.value, Label: item.label, remove: "Remover" })),
    [selected]
  );

  const handleRemoveOne = (itemValue) => {
    onSelectedChange((selected || []).filter((item) => item.value !== itemValue));
  };

  const headers = useMemo(
    () => [
      [
        { type: "SortingText", nRow: 1, name: columnLabel, property: "Label" },
        { type: "SortingText", nRow: 1, name: "Remover", property: "remove", justifyCenter: true },
      ],
    ],
    [columnLabel]
  );

  const columnsOptions = useMemo(
    () => ({
      Label: { type: "Text", center: false, bold: false, decimalPlace: false },
      remove: {
        type: "Button",
        text: "Remover",
        variant: "danger",
        onClick: (row) => handleRemoveOne(row.id),
        center: true,
        bold: false,
        decimalPlace: false,
      },
    }),
    [selected, onSelectedChange]
  );

  const handlePick = (values) => {
    const pickedIds = values || [];
    if (pickedIds.length > 0) {
      const existingIds = new Set((selected || []).map((item) => item.value));
      const toAdd = (options || []).filter(
        (opt) => pickedIds.includes(opt.value) && !existingIds.has(opt.value)
      );
      if (toAdd.length > 0) {
        onSelectedChange([...(selected || []), ...toAdd]);
      }
    }
    setPickerValue([]);
  };

  return (
    <div className="d-flex flex-column gap-2">
      <MultiSelect
        id={id}
        darkTheme={darkTheme}
        label={label}
        name={id}
        value={pickerValue}
        onChange={handlePick}
        onInputChange={onInputChange}
        options={availableOptions}
        placeholder={placeholder}
        isLoading={isLoading}
        noOptionsMessage={noOptionsMessage}
        loadingMessage={loadingMessage}
        isValid={isValid}
      />
      {rows.length > 0 ? (
        <SortingTable
          darkTheme={darkTheme}
          hasSort={false}
          headers={headers}
          setDataList={() => null}
          dataList={rows}
          columnsOptions={columnsOptions}
          nextPage={() => null}
          caption={tableCaption}
          iconsAltTexts={[]}
          project=""
          pagination={false}
          rowKey="id"
          itemsPaginationTexts={[]}
          nItemsPerPageTexts={[]}
          paginationButtonsTexts={[]}
        />
      ) : (
        <p className="text-muted">{emptyMessage}</p>
      )}
    </div>
  );
};

export default MultiSelectTable;
