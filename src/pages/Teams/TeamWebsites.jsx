import TeamResourceList from "./components/TeamResourceList";

const websitesResource = {
  key: "websites",
  label: "Sítios Web",
  singularLabel: "sítio web",
  singularArticle: "um sítio web",
  addButtonText: "Adicionar sítio web",
  removeButtonText: "Remover sítios web selecionados",
  searchApiPath: "/websites",
  optionLabel: (entry) => entry.title ?? entry.baseUrl,
  fetchApiPath: (teamId) => `/teams/${teamId}/websites`,
  patchApiPath: (teamId) => `/teams/${teamId}/websites`,
  mapRow: (item) => ({
    id: item.id,
    Title: item.title ?? item.baseUrl,
    BaseUrl: item.baseUrl,
  }),
  matchesSearch: (item, term) =>
    item.Title?.toLowerCase().includes(term) ||
    item.BaseUrl?.toLowerCase().includes(term),
  headers: [
    [
      { type: "Checkbox", nRow: 1, name: "Selecionar", property: "id" },
      { type: "SortingText", nRow: 1, name: "Sítio Web", property: "Title" },
      { type: "SortingText", nRow: 1, name: "URL", property: "BaseUrl" },
    ],
  ],
  columnsOptions: () => ({
    id: { type: "Checkbox", center: true, bold: false, decimalPlace: false },
    Title: {
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
    BaseUrl: { type: "Link", center: false, bold: false, decimalPlace: false, bigWidth: '60%', href: (row) => row.BaseUrl },
  }),
};

const TeamWebsites = () => <TeamResourceList resource={websitesResource} />;

export default TeamWebsites;
