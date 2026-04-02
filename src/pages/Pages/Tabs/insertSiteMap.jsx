import React from 'react';
import { Input, Button } from "@a12e/accessmonitor-ds";
const InsertSiteMap = ({ register, errors, darkTheme, onSubmit }) => {
  const fileInputRef = React.useRef(null);
  return (
    <div className="d-flex flex-column justify-content-start mt-4">
      <p>2b. Por submissão de um ficheiro com URLs</p>
      <p>
        Selecione um ficheiro TXT que contenha uma lista de URLs do sítio web pretendido (1 URL por linha).
      </p>
      <Input
        id="sitemap"
        ref={fileInputRef}
        label="Ficheiro TXT com URLs"
        type="file"
        darkTheme={darkTheme}
        accept=".txt"
        {...register("sitemap", { required: "Campo obrigatório" })}
        error={errors.sitemap?.message}
        className="w-50"
      />
      
      <div className="d-flex justify-content-start mt-3">
        <Button
          type="button"
          text="Adicionar Páginas via Ficheiro"
          variant="primary"
          darkTheme={darkTheme}
          onClick={onSubmit}
        />
      </div>
    </div>
  );
};

export default InsertSiteMap;