import React from "react";
import {
  Input,
  Button,
  Select,
  TextArea,
  Breadcrumb,
  Tabs,
} from "ama-design-system";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import InsertUrl from "./Tabs/insertUrl";
import InsertSiteMap from "./Tabs/insertSiteMap";
import InsertCrawling from "./Tabs/insertCrawling";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
const PageCreateForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { t } = useTranslation();
  const [breadcrumbs, setBreadcrumbs] = React.useState([
    { children: <Link to="/">Início</Link> },
    {
      title: "Criar Página",
    },
  ]);
  const { theme } = useTheme();
  const onSubmit = (data) => {
    console.log("User data:", data);
  };

  const TabsWithComponenets = (
    <Tabs
      defaultActiveKey="tab1"
      darkTheme={theme}
      tabs={[
        {
          component: <InsertUrl darkTheme={theme} register={register} errors={errors} />,
          eventKey: "tab1",
          title: t('PAGES_PAGE.ADD.insert_url_tab'),
        },
        {
          component: <InsertSiteMap darkTheme={theme} register={register} errors={errors} />,
          eventKey: "tab2",
          title: t('PAGES_PAGE.ADD.insert_sitemap_tab'),
        },
        {
          component: <InsertCrawling darkTheme={theme} register={register} errors={errors} />,
          eventKey: "tab3",
          title: t('PAGES_PAGE.ADD.crawling_tab'),
        },
      ]}
    />
  );
  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1>{t('PAGES_PAGE.ADD.title')}</h1>
      
      <form className="bg-white" onSubmit={handleSubmit(onSubmit)}>
        {/* Seção 1: Informações básicas */}
        <p >
        {t('PAGES_PAGE.ADD.description')}
      </p>

      <h2>Métodos de adicionar páginas a um sítio web:</h2>
      <ul className="list-style-disc" style={{ listStyleType: "disc" }}>
        <li>Submeter manualmente uma lista de URLs;</li>
        <li>Submeter um ficheiro em formato sitemap;</li>
        <li>Solicitar crawling ao sítio web.</li>
      </ul>
        <div >
          <h2 className="mb-4">
            1. Em sítio web pretende efetuar a adição de páginas?
          </h2>
          <div className="w-50">
          <Input
            id="name"
            darkTheme={theme}
            label="Sítio web (URL inicial):"
            {...register("name", { required: "Campo obrigatório" })}
            error={errors.name?.message}
          />
          </div>
        </div>

        <div className=" mt-5">
          <h2 className="mb-4">
            2. De que forma deseja adicionar as novas páginas?
          </h2>
          <p>Selecione apenas um dos processos abaixo:</p>
          <div className="mt-5">{TabsWithComponenets}</div>
        </div>
      </form>
    </div>
  );
};

export default PageCreateForm;
