import React from 'react';
import { Input, Button, Select, Tabs } from "ama-design-system";

const UsuabilitySeal = ({ register, errors }) => {
    return (
         <div>
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
    );
};

export default UsuabilitySeal;