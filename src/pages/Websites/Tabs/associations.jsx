import React from 'react';
import { Input, Button, MultiSelect } from "@a12e/accessmonitor-ds";
import { useTranslation } from "react-i18next";

const Associations = ({
  register,
  errors,
  darkTheme,
  entityOptions,
  userOptions,
  categoryOptions,
  entityValue,
  userValue,
  categoryValue,
  onEntityChange,
  onUserChange,
  onCategoryChange,
  onEntitySearch,
  entitySearch,
  onUserSearch,
  userSearch,
  onCategorySearch,
  categorySearch,
  // Validation props
  entityValidation,
  userValidation,
  categoryValidation
}) => {
  const { t } = useTranslation();
  return (
    <div className='w-50 d-flex flex-column gap-3'>
      <h2 className="mb-4">{t('WEBSITES_PAGE.ADD.associations_label')}</h2>

      <MultiSelect
        darkTheme={darkTheme}
        id="entities"
        label={t('WEBSITES_PAGE.ADD.entities_label') + ` ${t('HEADER.optional')}`}
        options={entityOptions}
        placeholder={t('WEBSITES_PAGE.ADD.entities_label')}
        value={entityValue}
        onChange={onEntityChange}
        onInputChange={onEntitySearch}
        inputValue={entitySearch}
        isValid={true}
        invalidFeedback={""}
        validFeedback={""}
      />

      <MultiSelect
        darkTheme={darkTheme}
        id="users"
        label={t('WEBSITES_PAGE.ADD.users_label') + ` ${t('HEADER.optional')}`}
        options={userOptions || []}
        placeholder={t('WEBSITES_PAGE.ADD.users_label')}
        value={userValue}
        onChange={onUserChange}
        onInputChange={onUserSearch}
        inputValue={userSearch}
        isValid={true}
        invalidFeedback={""}
        validFeedback={""}
      />

      <MultiSelect
        darkTheme={darkTheme}
        id="categories"
        label={t('WEBSITES_PAGE.ADD.categories_label') + ` ${t('HEADER.optional')}`}
        options={categoryOptions || []}
        placeholder={t('WEBSITES_PAGE.ADD.categories_label')}
        value={categoryValue}
        onChange={onCategoryChange}
        onInputChange={onCategorySearch}
        inputValue={categorySearch}
        isValid={true}
        invalidFeedback={""}
        validFeedback={""}
      />
    </div>
  );
};

export default Associations;