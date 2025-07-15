import React from "react";
import { Input, Button, Select, Tabs, Breadcrumb } from "ama-design-system";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import AcessibilityDeclaration from "./Tabs/acessiblityDeclaration";
import UsuabilitySeal from "./Tabs/usuabilitySeal";
import Associations from "./Tabs/associations";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
const WebSiteCreateForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { t } = useTranslation();
  const onSubmit = (data) => {
    console.log("User data:", data);
  };
  const { theme } = useTheme();
    const breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
        {
            title: "Criar Sítio Web",
        }
    ];

  const TabsWithComponenets = (<Tabs
  defaultActiveKey="tab1"
  tabs={[
    {
      component: <AcessibilityDeclaration 
        register={register}
        errors={errors}
        darkTheme={theme}
      />,
      eventKey: 'tab1',
      title: t('WEBSITES_PAGE.ADD.declaration_label')
    },
    {
      component: <UsuabilitySeal 
        register={register}
        errors={errors}
        darkTheme={theme}
      />,
      eventKey: 'tab2',
      title: t('WEBSITES_PAGE.ADD.stamp_label')
    },
    {
      component: <Associations
        register={register}
        errors={errors}
        darkTheme={theme}
        />,
      eventKey: 'tab3',
      title: t('WEBSITES_PAGE.ADD.associations_label')
    }
  ]}
/>)

  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1>{t('WEBSITES_PAGE.ADD.title')}</h1>
  

      <form className="bg-white" onSubmit={handleSubmit(onSubmit)}>
        {/* Seção 1: Informações básicas */}
        <p>{t('WEBSITES_PAGE.ADD.description_website')}</p>
        <div >
          
          <h2 className="mb-4">{t('WEBSITES_PAGE.ADD.new_website')}</h2>
          <div className="w-50 d-flex flex-column gap-4">
          <Input
            id="name"
            label={t('WEBSITES_PAGE.ADD.name_label')}
            {...register("name", { required: t('MISC.required_field') })}
            error={errors.name?.message}
            darkTheme={theme}
          />

          <Input
            id="initial_url"
            label="URL Inicial"
            {...register("initial_url", { required: "Campo obrigatório" })}
            error={errors.initial_url?.message}
            darkTheme={theme}
          />
          </div>
        </div>

        {/* Seção 2: Declaração e Selo */}
        <div className=" mt-5">
            {TabsWithComponenets}
            <div className="d-flex justify-content-start gap-3 mt-4">
          <Button
            type="submit"
            text="Guardar e Sair"
            variant="primary"
            style={{width: "150px"}}
            darkTheme={theme}
            onClick={() => console.log("Guardar e Sair")}
          />
          <Button
            type="button"
            style={{width: "150px"}}
            text="Sair"
            variant="danger"
            darkTheme={theme}
            onClick={() => console.log("Sair")}
          />
        </div>
        </div>


     
      </form>
    </div>
  );
};

export default WebSiteCreateForm;
