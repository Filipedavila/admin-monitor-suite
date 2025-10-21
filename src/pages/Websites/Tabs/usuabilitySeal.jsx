import React from 'react';
import { Input, Button, Select, Tabs } from "ama-design-system";
import { useTranslation } from 'react-i18next';
import moment from 'moment';

const UsuabilitySeal = ({ 
    register, 
    errors, 
    darkTheme, 
    setValue, 
    typeSealValidation, 
    onTypeSealChange,
    onDateFieldChange,
    sealDateValidation,
    watch
}) => {
    const { t } = useTranslation();
    // No validation rules needed - fields are now optional
    return (
         <div  className='w-50 d-flex flex-column gap-3'>
            <h2 className="mb-4">{t('WEBSITES_PAGE.ADD.stamp_label')}</h2>
            <Select
              darkTheme={darkTheme}
              id="type_seal"
              label={t('WEBSITES_PAGE.ADD.stamp_type_label')}
              {...register("type_seal")}
              error={typeSealValidation?.isValid === false ? typeSealValidation.message : errors.type_seal?.message}
              required={false}
              value={watch("type_seal")}
              options={[
                { value: "0", label: "Selecione" },
                { value: "1", label: t('WEBSITES_PAGE.ADD.stamp_bronze') },
                { value: "2", label: t('WEBSITES_PAGE.ADD.stamp_silver') },
                { value: "3", label: t('WEBSITES_PAGE.ADD.stamp_gold') },
              ]}
              onChange={onTypeSealChange}
            />
            <Input
              darkTheme={darkTheme}
              id="usability_seal_date"
              label={t('WEBSITES_PAGE.ADD.stamp_date_label')}
              type="date"
              value={watch("usability_seal_date") ? moment(watch("usability_seal_date")).format("YYYY-MM-DD") : ""}
              {...register("usability_seal_date")}
              error={sealDateValidation?.isValid === false ? sealDateValidation.message : errors.usability_seal_date?.message}
              onChange={e => onDateFieldChange("usability_seal_date", e.target.value, "tab2")}
            />
          </div>
    );
};

export default UsuabilitySeal;