import React from "react";
import { Input, Button, Select, TextArea, Breadcrumb, Tabs } from "ama-design-system";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import InsertUrl from "./Tabs/insertUrl";
import InsertSiteMap from "./Tabs/insertSiteMap";
import InsertCrawling from "./Tabs/insertCrawling";

const PageCreateForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [breadcrumbs, setBreadcrumbs] = React.useState([
    { children: <Link to="/">Home</Link> },
    {
      title: "Dashboard",
    }
  ]);

  const onSubmit = (data) => {
    console.log("User data:", data);
  };

    const TabsWithComponenets = (<Tabs
  defaultActiveKey="tab1"
  tabs={[
    {
      component: <InsertUrl 
        register={register}
        errors={errors}
      />,
      eventKey: 'tab1',
      title: 'Inserir URLs'
    },
    {
      component: <InsertSiteMap
        register={register}
        errors={errors}
      />,
      eventKey: 'tab2',
      title: 'Inserir Sitemap'
    },
    {
      component: <InsertUrl
        register={register}
        errors={errors}
        />,
      eventKey: 'tab3',
      title: 'Crawling'
    }
  ]}
/>);
  return (
    <div>
      <h1>Criar Páginas Web</h1>
      <p className="w-50">
        Nesta página é possível adicionar amostras de páginas a um sítio web.
      </p>

      <h4>Métodos de adicionar páginas a um sítio web:</h4>
      <ul className="list-style-disc" style={{ listStyleType: "disc" }}>
        <li>Submeter manualmente uma lista de URLs;</li>
        <li>Submeter um ficheiro em formato sitemap;</li>
        <li>Solicitar crawling ao sítio web.</li>
      </ul>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Seção 1: Informações básicas */}
        <div className="bg-white p-4">
          <h2 className="mb-4">
            1. Em sítio web pretende efetuar a adição de páginas?
          </h2>
          <Input
            label="Sítio web (URL inicial):"
            {...register("name", { required: "Campo obrigatório" })}
            error={errors.name?.message}
          />
        </div>

        <div className="bg-white p-4 mt-5">
          <h2 className="mb-4">
            2. De que forma deseja adicionar as novas páginas?
          </h2>
          <p>Selecione apenas um dos processos abaixo:</p>
          <div className="mt-5">

      
      {TabsWithComponenets}
         
          </div>
        </div>

      </form>
    </div>
  );
};

export default PageCreateForm;
