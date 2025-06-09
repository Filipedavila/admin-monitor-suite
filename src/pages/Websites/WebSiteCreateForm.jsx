import React from "react";
import { Input, Button, Select, Tabs } from "ama-design-system";
import { useForm } from "react-hook-form";
import AcessibilityDeclaration from "./Tabs/acessiblityDeclaration";
import UsuabilitySeal from "./Tabs/usuabilitySeal";
import Associations from "./Tabs/associations";
const WebSiteCreateForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("User data:", data);
  };

  const TabsWithComponenets = (<Tabs
  defaultActiveKey="tab1"
  tabs={[
    {
      component: <AcessibilityDeclaration 
        register={register}
        errors={errors}
      />,
      eventKey: 'tab1',
      title: 'Declaração de Acessibilidade'
    },
    {
      component: <UsuabilitySeal 
        register={register}
        errors={errors}
      />,
      eventKey: 'tab2',
      title: 'Selo de Usabilidade e Acessibilidade'
    },
    {
      component: <Associations
        register={register}
        errors={errors}
        />,
      eventKey: 'tab3',
      title: 'Associações'
    }
  ]}
/>)

  return (
    <div>
      <h1>Criar Sítios Web</h1>
      <p className="w-50">
        O sítio web é a unidade de análise mais relevante do Observatório.
        A análise das práticas de acessibilidade faz-se à amostra de páginas
        que fazem parte do sítio. Os sítios são agregados em Categorias e
        Diretórios e pertencem a Entidades.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Seção 1: Informações básicas */}
        <div className="bg-white p-4">
          <h2 className="mb-4">Novo Website</h2>

          <Input
            label="Nome"
            {...register("name", { required: "Campo obrigatório" })}
            error={errors.name?.message}
          />

          <Input
            label="URL Inicial"
            {...register("initial_url", { required: "Campo obrigatório" })}
            error={errors.initial_url?.message}
          />
        </div>

        {/* Seção 2: Declaração e Selo */}
        <div className="bg-white p-4 mt-5">
            {TabsWithComponenets}
        </div>

        {/* Seção 3: Associações */}
        <div className="bg-white d-flex align-items-end justify-content-between p-4 flex-column">

             {/* Botões */}
        <div className="d-flex gap-3">
          <Button
            type="button"
            text="Guardar e Sair"
            variant="primary"
            style={{width: "150px"}}
            onClick={() => console.log("Guardar e Sair")}
          />
          <Button
            type="button"
            style={{width: "150px"}}
            text="Sair"
            variant="ghost"
            onClick={() => console.log("Sair")}
          />
        </div>
        </div>

     
      </form>
    </div>
  );
};

export default WebSiteCreateForm;
