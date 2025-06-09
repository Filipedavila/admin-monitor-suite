import React from 'react';
import { TextArea, Button } from "ama-design-system";
const InsertUrl = ({ register, errors}) => {
    return (
                <div className="p-3 d-flex flex-row justify-content-between flex-column p-4 border-left">
              <p>2a. Por submissão de lista de URLs</p>
              <p>
                Compile uma lista de URLs do sítio web pretendido (1 URL por
                linha) e cole essa lista no campo "Novos URLs" abaixo.
              </p>
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

    );
};

export default InsertUrl;