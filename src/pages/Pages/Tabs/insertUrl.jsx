import React from 'react';
import { TextArea, Button } from "@a12e/accessmonitor-ds";

const InsertUrl = ({ register, errors, darkTheme, onSubmit, setUrls}) => {
    const { onChange: registerOnChange, ...registerRest } = register("urls", { required: "Campo obrigatório" });
    
    const handleChange = (e) => {
      // Call react-hook-form's onChange first
      registerOnChange(e);
      // Then update the value using setValue as backup
      setUrls("urls", e.target.value);
    };

    return (
      <>
        <div className="d-flex flex-row justify-content-between flex-column border-left">
          <p>2a. Por submissão de lista de URLs</p>
          <p>
            Compile uma lista de URLs do sítio web pretendido (1 URL por
            linha) e cole essa lista no campo "Novos URLs" abaixo.
          </p>
          <TextArea
            id="urls"
            label="Novos URLs"
            {...registerRest}
            error={errors.urls?.message}
            rows={10}
            className="w-50"
            darkTheme={darkTheme}
            onChange={handleChange}
          />
        </div>
        <div className="d-flex justify-content-start">
          <Button
            type="button"
            text="Adicionar Páginas"
            variant="primary"
            darkTheme={darkTheme}
            onClick={onSubmit}
          />
        </div>
      </>
    );
};

export default InsertUrl;