import React from "react";
import { Input, Button, Select,TextArea } from "ama-design-system";
import { useForm } from "react-hook-form";

const PageCreateForm = () => {
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
      <h1>Criar Páginas Web</h1>
      <p className="w-50">
        Nesta página é possível adicionar amostras de páginas a um sítio web.
      </p>

      <h4>Métodos de adicionar páginas a um sítio web:</h4>
      <ul className="list-style-disc" style={{ listStyleType: "disc"}}>
        <li>Submeter manualmente uma lista de URLs;</li>
        <li>Submeter um ficheiro em formato sitemap;</li>
        <li>Solicitar crawling ao sítio web.</li>
      </ul>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Seção 1: Informações básicas */}
        <div className="bg-white p-4">
          <h2 className="mb-4">1. Em sítio web pretende efetuar a adição de páginas?</h2>
          <Input
            label="Sítio web (URL inicial):"
            {...register("name", { required: "Campo obrigatório" })}
            error={errors.name?.message}
          />
        </div>

            <div className="bg-white p-4">
          <h2 className="mb-4">2. De que forma deseja adicionar as novas páginas?</h2>
          <p>Selecione apenas um dos processos abaixo:</p>
          <div className="d-flex flex-col gap-3">
              <div className="w-50">
                <h3>2a. Por submissão de lista de URLs</h3>
                <p>Compile uma lista de URLs do sítio web pretendido (1 URL por linha) e cole essa lista no campo "Novos URLs" abaixo.</p>
                <TextArea
                  label="Novos URLs"
                  {...register("urls", { required: "Campo obrigatório" })}
                  error={errors.urls?.message}
                  rows={10}
                  />
                  <Button
                    type="submit"
                    text="Adicionar Páginas"
                    className="mt-3"
                    variant="primary"
                    onClick={() => console.log("Páginas adicionadas")}
                  />
              </div>

  <div className="w-50">                <h3>2b. Por submissão de um siteMap</h3>
                <p>Compile uma lista de URLs do sítio web pretendido (1 URL por linha) e cole essa lista no campo "Novos URLs" abaixo.</p>
               <Input
                  label="Ficheiro"
                  type="file"
                  {...register("sitemap", { required: "Campo obrigatório" })}
                  error={errors.sitemap?.message}
                />
             
              </div>

              
  <div className="w-50">                <h3>2c. Solicitar um crawling ao sítio web</h3>
                <p>Se pretende que o robô do AdminMonitorSuite produza uma amostra automaticamente pressione no botão abaixo. O robô irá gerar uma amostra segundo o método H+ Depois basta ir à página "Crawler" e importar a amostra de páginas recolhidas pelo robô.</p>
                <Button
                  type="button"
                  text="Gerar Crawler"
                  className="mt-3"
                  variant="primary"
                  onClick={() => console.log("Crawling solicitado")}
                />
              </div>
                
          </div>
        </div>

        {/* Seção 2: Declaração e Selo */}


      </form>
    </div>
  );
};

export default PageCreateForm;
