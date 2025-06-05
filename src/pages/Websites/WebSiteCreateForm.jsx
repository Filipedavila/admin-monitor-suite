import React from "react";
import { Input, Button, Select } from "ama-design-system";
import { useForm } from "react-hook-form";

const WebSiteCreateForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("User data:", data);
  };

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
        <div className="bg-white p-4 mt-5 d-flex flex-col gap-5">
          <div className="w-50">
            <h2 className="mb-4">Declaração de Acessibilidade</h2>
            <Select
              label="Conformidade declarada?"
              {...register("compliance", { required: "Campo obrigatório" })}
              error={errors.compliance?.message}
              options={[
                { value: "yes", label: "Sim" },
                { value: "no", label: "Não" },
              ]}
            />

            <Input
              label="Data da Declaração:"
              type="date"
              {...register("accessibility_declaration_date", { required: "Campo obrigatório" })}
              error={errors.accessibility_declaration_date?.message}
            />

            <Input
              label="Email de Contacto"
              type="email"
              {...register("email", { required: "Campo obrigatório" })}
              error={errors.email?.message}
            />
          </div>

          <div className="w-50">
            <h2 className="mb-4">Selo de Usabilidade e Acessibilidade</h2>
            <Select
              label="Tipo de Selo?"
              {...register("type_seal", { required: "Campo obrigatório" })}
              error={errors.type_seal?.message}
              options={[
                { value: "1", label: "Bronze" },
                { value: "2", label: "Prata" },
                { value: "3", label: "Ouro" },
              ]}
            />
            <Input
              label="Data do Selo (atribuição/renovação):"
              type="date"
              {...register("usability_seal_date", { required: "Campo obrigatório" })}
              error={errors.usability_seal_date?.message}
            />
          </div>
        </div>

        {/* Seção 3: Associações */}
        <div className="bg-white d-flex align-items-end p-4 flex-col">
            <div className="w-50">
          <h2 className="mb-4">Associações</h2>

          <Select
            label="Associar Entidade(s) (opcional):"
            {...register("entities")}
            options={[
              { value: "entidade1", label: "Entidade 1" },
              { value: "entidade2", label: "Entidade 2" },
              { value: "entidade3", label: "Entidade 3" },
            ]}
            isMulti
          />

          <Select
            label="Associar Utilizador(es) (opcional):"
            {...register("users")}
            options={[
              { value: "utilizador1", label: "Utilizador 1" },
              { value: "utilizador2", label: "Utilizador 2" },
              { value: "utilizador3", label: "Utilizador 3" },
            ]}
            isMulti
          />

          <Select
            label="Associar Categoria(s) (opcional):"
            {...register("categories")}
            options={[
              { value: "categoria1", label: "Categoria 1" },
              { value: "categoria2", label: "Categoria 2" },
              { value: "categoria3", label: "Categoria 3" },
            ]}
            isMulti
          />
</div>
             {/* Botões */}
        <div className="d-flex gap-3">
          <Button
            type="button"
            text="Guardar e Sair"
            variant="success"
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
