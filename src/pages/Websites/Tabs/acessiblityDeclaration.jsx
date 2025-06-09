import React from 'react';
import { Input, Button, Select, Tabs } from "ama-design-system";

const AcessibilityDeclaration = ({ register, errors }) => {
    return (
         <div >
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
    );
};

export default AcessibilityDeclaration;