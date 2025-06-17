import React, { useState } from "react";
import {
  Button,
  InputSearch,
  SortingTable,
  Breadcrumb,
} from "ama-design-system";
import "./style.users.css";
import {
  directoriesHeaders,
  dataRows,
  columnsOptions,
  nameOfIcons,
  paginationButtonsTexts,
} from "./table.config";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const UserList = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { theme } = useTheme();
  const breadcrumbs = [
    { children: <Link to="/">Home</Link> },
    { title: "Dashboard" },
  ];

  const [data, setData] = useState(dataRows);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);

  const onSubmit = (formData) => {
    console.log("User data:", formData);
    // Lógica de criação de utilizador, se for o caso
  };

  return (
    <div>
      <h1>Utilizadores</h1>
      <p>
        Abaixo encontra a listagem de todos os utilizadores registados no
        AdminMonitorSuite, num total de 38 diretórios.
      </p>

      <div className="content bg-white">
        <h2>Lista de Utilizadores</h2>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <span>Filtrar utilizadores:</span>
            <InputSearch
              placeholder="Pesquisar utilizadores..."
              style={{ width: "87%" }}
              // Você pode conectar esse campo ao formulário com register se quiser buscar no submit
            />
          </div>

          <div className="d-flex gap-4 justify-content-end mb-4">
            <Button
              text="Criar Utilizador"
              icon="AMA-Adicionar-Line"
              className="btn-primary"
              onClick={() => console.log("Criar Utilizador")}
            />
            <Button
              text="Apagar Utilizadores"
              icon="AMA-Apagar-Line"
              variant="danger"
              onClick={() =>
                console.log(
                  "Apagar Utilizadores selecionados:",
                  checkboxesSelected
                )
              }
              disabled={checkboxesSelected.length === 0}
            />
          </div>

        <SortingTable
          darkTheme={theme === 'dark'}
          headers={directoriesHeaders}
          setDataList={setData}
          dataList={data}
          columnsOptions={columnsOptions}
          nextPage={() => null}
          caption="Estatísticas do diretório: Os 25 Portais + Procurados da AP"
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project=""
          setCheckboxesSelected={setCheckboxesSelected}
        />
      </div>
    </div>
  );
};

export default UserList;
