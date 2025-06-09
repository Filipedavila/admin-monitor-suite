import React from 'react';
import { Input } from "ama-design-system";
const InsertSiteMap = ({ register, errors}) => {
    return (
           <div className="d-flex flex-column justify-content-start mt-4">
              <p>2b. Por submissão de um siteMap</p>
              <p>
                Compile uma lista de URLs do sítio web pretendido (1 URL por
                linha) e cole essa lista no campo "Novos URLs" abaixo.
              </p>
              <Input
                label="Ficheiro"
                type="file"
                {...register("sitemap", { required: "Campo obrigatório" })}
                error={errors.sitemap?.message}
              />
            </div>
    );
};

export default InsertSiteMap;