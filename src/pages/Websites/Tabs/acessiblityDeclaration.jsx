import React from 'react';
import { Input, Button, Select, Tabs } from "@a12e/accessmonitor-ds";
import { useTranslation } from 'react-i18next';
import moment from 'moment';

const AcessibilityDeclaration = ({ 
    register, 
    errors, 
    darkTheme, 
    setValue, 
    complianceValidation, 
    onComplianceChange,
    onDateFieldChange,
    declarationDateValidation,
    watch
}) => {
    const { t } = useTranslation();
    return (
         <div className='w-50 d-flex flex-column gap-3'>
            <h2 className="mb-4">{t('WEBSITES_PAGE.ADD.declaration_label')}</h2>
            <Select
              darkTheme={darkTheme}
              id="compliance"
              value={watch("compliance")}
              label={t('WEBSITES_PAGE.ADD.compliance_label')}
              {...register("compliance")}
              error={complianceValidation?.isValid === false ? complianceValidation.message : errors.compliance?.message}
              required={false}
              options={[
                { value: "0", label: "Selecione" },
                { value: "2", label: "Declaração parcialmente conforme" },
                { value: "3", label: "Declaração plenamente conforme" },
                { value: "1", label:"Declaração não conforme" },
              ]}
              onChange={onComplianceChange}
            />

            <Input
              darkTheme={darkTheme}
              value={watch("accessibility_declaration_date") ? moment(watch("accessibility_declaration_date")).format("YYYY-MM-DD") : ""}
              id="accessibility_declaration_date"
              label={t('WEBSITES_PAGE.ADD.declaration_date_label')}
              type="date"
              {...register("accessibility_declaration_date")}
              error={declarationDateValidation?.isValid === false ? declarationDateValidation.message : errors.accessibility_declaration_date?.message}
              onChange={e => onDateFieldChange("accessibility_declaration_date", e.target.value, "tab1")}
            />
          </div>
    );
};

export default AcessibilityDeclaration;