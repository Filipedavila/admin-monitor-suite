import TeamResourceList from "./components/TeamResourceList";

const usersResource = {
  key: "users",
  label: "Utilizadores",
  singularLabel: "utilizador",
  singularArticle: "um utilizador",
  addButtonText: "Adicionar utilizador",
  removeButtonText: "Remover utilizadores selecionados",
  searchApiPath: "/users",
  optionLabel: (entry) => entry.username,
  fetchApiPath: (teamId) => `/teams/${teamId}/members`,
  patchApiPath: (teamId) => `/teams/${teamId}/members`,
  mapRow: (item) => ({
    id: item.id,
    Username: item.username,
    Aplicacao: item.role?.displayName ?? "—",
  }),
  matchesSearch: (item, term) =>
    item.Username?.toLowerCase().includes(term) ||
    item.Aplicacao?.toLowerCase().includes(term),
  headers: [
    [
      { type: "Checkbox", nRow: 1, name: "Selecionar", property: "id" },
      { type: "SortingText", nRow: 1, name: "Utilizador", property: "Username" },
      { type: "SortingText", nRow: 1, name: "Aplicação", property: "Aplicacao", justifyCenter: true },
    ],
  ],
  columnsOptions: () => ({
    id: { type: "Checkbox", center: true, bold: false, decimalPlace: false },
    Username: {
      type: "Text",
      center: true,
      bold: false,
      decimalPlace: false,
      isCheckboxLabel: true,
      children: (row, value) => (
        <label htmlFor={"checkbox_" + row.id} className="ama-typography-body bold">
          {value}
        </label>
      ),
    },
    Aplicacao: { type: "Text", center: true, bold: false, decimalPlace: false },
  }),
};

const TeamUsers = () => <TeamResourceList resource={usersResource} />;

export default TeamUsers;
