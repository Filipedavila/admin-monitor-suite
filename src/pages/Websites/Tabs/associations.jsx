import React from 'react';
import { Input, Button, Select, Tabs } from "ama-design-system";

const Associations = ({ register, errors }) => {
    return (
                <div>
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
    );
};

export default Associations;