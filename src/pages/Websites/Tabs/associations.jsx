import { Select } from "@a12e/accessmonitor-ds";
import { useTranslation } from "react-i18next";
import MultiSelectTable from "../../../components/MultiSelectTable";

const Associations = ({
  darkTheme,
  institutionOptions,
  categoryOptions,
  institutionValue,
  categoryValue,
  onInstitutionChange,
  onCategoryChange,
  onCategorySearch,
  isCategoryLoading,
}) => {
  const { t } = useTranslation();
  return (
    <div className='w-50 d-flex flex-column gap-3'>
      <h2 className="mb-4">{t('WEBSITES_PAGE.ADD.associations_label')}</h2>

      <Select
        darkTheme={darkTheme}
        id="institution"
        label={t('WEBSITES_PAGE.ADD.entities_label') + ` ${t('HEADER.optional')}`}
        options={[{ value: "", label: "Selecione" }, ...institutionOptions]}
        value={institutionValue ?? ""}
        onChange={onInstitutionChange}
      />

      <MultiSelectTable
        darkTheme={darkTheme}
        id="categories"
        label={t('WEBSITES_PAGE.ADD.categories_label') + ` ${t('HEADER.optional')}`}
        options={categoryOptions || []}
        placeholder="Pesquise e selecione categorias..."
        selected={categoryValue}
        onSelectedChange={onCategoryChange}
        onInputChange={onCategorySearch}
        isLoading={isCategoryLoading}
        noOptionsMessage={() => "Nenhuma categoria encontrada"}
        loadingMessage={() => "A pesquisar..."}
        isValid={true}
        columnLabel="Categoria"
        tableCaption="Categorias selecionadas"
        emptyMessage="Nenhuma categoria selecionada."
      />
    </div>
  );
};

export default Associations;
