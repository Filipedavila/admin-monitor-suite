import React from "react";
import {
  Input,
  Button,
  Select,
  TextArea,
  Breadcrumb,
  Tabs,
  MultiSelect,
} from "ama-design-system";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import InsertUrl from "./Tabs/insertUrl";
import InsertSiteMap from "./Tabs/insertSiteMap";
import InsertCrawling from "./Tabs/insertCrawling";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { api } from "../../config/api";
import { Modal } from "../../components/Modal";
import CrawlingModal from "../../components/CrawlingModal";

const PageCreateForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [breadcrumbs, setBreadcrumbs] = React.useState([
    { children: <Link to="/dashboard/home">Inicio</Link> },
    { children: <Link to="/dashboard/pages">Paginas</Link> },
    {
      title: "Criar Pagina",
    },
  ]);
  const { theme } = useTheme();
  const [websites, setWebsites] = React.useState([]);
  const [selectedWebsites, setSelectedWebsites] = React.useState([]);
  const [websitesLoading, setWebsitesLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [urls, setUrls] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("tab1");
  const [feedbackMessage, setFeedbackMessage] = React.useState("");
  const [showCrawlingModal, setShowCrawlingModal] = React.useState(false);
  const [shouldClearForm, setShouldClearForm] = React.useState(false);

  // Function to fetch websites with search term
  const fetchWebsites = React.useCallback(async (search = '') => {
    try {
      setWebsitesLoading(true);
      const response = await api.get(`/website/all/100/0/sort=/direction=/search=${encodeURIComponent(search)}`);
      const websitesData = response.data.result.map(website => ({
        value: website.WebsiteId,
        label: `${website.Name} (${website.StartingUrl})`,
        startingUrl: website.StartingUrl,
        name: website.Name
      }));
      setWebsites(websitesData);
    } catch (error) {
      console.error('Error fetching websites:', error);
      setWebsites([]);
    } finally {
      setWebsitesLoading(false);
    }
  }, []);

  // Debounced search effect
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchWebsites(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchWebsites]);

  // Initial load
  React.useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  const onSubmit = (data) => {
    console.log("activeTab", activeTab)
    if(activeTab === "tab1") {
      handleInsertPages(data);
    } else if(activeTab === "tab2") {
      handleInsertSiteMap(data);
    } else if(activeTab === "tab3") {
      setShowCrawlingModal(true);
    }
  };

  // Function to trigger form submission programmatically
  const triggerSubmit = async () => {
      const formData = getValues();
      onSubmit(formData);
  };

  const handleInsertPages = async (data) => {
    // Validate that we have a website selected
    if (selectedWebsites.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sitio web.");
      return;
    }

    // Validate that we have URLs
    if (!data.urls || data.urls.trim() === "") {
      setFeedbackMessage("Por favor, insira pelo menos um URL.");
      return;
    }

    // Process URLs: split by newline, trim whitespace, filter empty lines
    const urls = data.urls
      .split("\n")
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      setFeedbackMessage("Por favor, insira pelo menos um URL valido.");
      return;
    }

    try {
      const response = await api.post('/page/add', {
        websiteId: selectedWebsites[0].value,
        uris: JSON.stringify(urls),
        observatory: "[]"
      });
      
      if(response.status === 200 || response.status === 201) {
        setFeedbackMessage(`${urls.length} pagina(s) adicionada(s) com sucesso. As paginas serao avaliadas em segundo plano.`);
        setShouldClearForm(true); // Mark form to be cleared when modal closes
      } else {
        setFeedbackMessage("Erro ao adicionar paginas");
      }
    } catch (error) {
      console.error("Error adding pages:", error);
      setFeedbackMessage("Erro ao adicionar paginas. Tente novamente.");
    }
  };

  const handleInsertSiteMap = async (data) => {
    console.log("handleInsertSiteMap called with data:", data);
    
    if (selectedWebsites.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sitio web.");
      return;
    }

    // Get the file input element directly
    const fileInput = document.getElementById('sitemap');
    console.log("File input element:", fileInput);
    console.log("File input files:", fileInput?.files);
    
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      console.log("No file selected");
      setFeedbackMessage("Por favor, selecione um ficheiro sitemap.");
      return;
    }

    const file = fileInput.files[0];
    console.log("Selected file:", file);
    
    try {
      // Read the file content
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      // Extract URLs from file content (one URL per line)
      const urls = fileContent
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      if (urls.length === 0) {
        setFeedbackMessage("O ficheiro nao contem URLs validos.");
        return;
      }

      // Use the same logic as handleInsertPages
      const response = await api.post('/page/add', {
        websiteId: selectedWebsites[0].value,
        uris: JSON.stringify(urls),
        observatory: "[]"
      });

      if (response.status === 200 || response.status === 201) {
        setFeedbackMessage(`${urls.length} paginas do sitemap adicionadas com sucesso. As paginas serao avaliadas em segundo plano.`);
        setShouldClearForm(true); // Mark form to be cleared when modal closes
      } else {
        setFeedbackMessage("Erro ao adicionar paginas do sitemap");
      }
    } catch (error) {
      console.error("Error processing sitemap file:", error);
      setFeedbackMessage("Erro ao processar o ficheiro sitemap");
    }
  };

  const handleCrawling = async ({ maxDepth, maxPages, waitJS }) => {
    if (selectedWebsites.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sitio web para fazer crawling.");
      return;
    }
    
    const website = websites.filter(website => website.value === selectedWebsites[0].value).map(website => ({
      url: website.startingUrl,
      websiteId: website.value
    }));
    
    try {
      const response = await api.post('/crawler/crawl', {
        websites: website,
        maxDepth: maxDepth,
        maxPages: maxPages,
        waitJS: waitJS ? 1 : 0
      });
      
      if (response.status === 201 || response.status === 200) {
        setFeedbackMessage("O crawling foi iniciado com sucesso! O processo sera executado em segundo plano.");
        setSelectedWebsites([]);
        setShowCrawlingModal(false);
      }
    } catch (error) {
      setFeedbackMessage("Erro ao iniciar o crawling. Tente novamente.");
    }
  };

  const handleModalClose = () => {
    setFeedbackMessage("");
    // Navigate to websites list after successful submission
    if (shouldClearForm) {
      setShouldClearForm(false);
      navigate("/dashboard/websites");
    }
  };

  const TabsWithComponenets = (
    <Tabs
      activeKey={activeTab}
      onTabChange={(key) => {
        setActiveTab(key);
      }}
      darkTheme={theme}
      tabs={[
        {
          component: <InsertUrl darkTheme={theme} register={register} setUrls={setValue} errors={errors} onSubmit={triggerSubmit} />,
          eventKey: "tab1",
          title: t('PAGES_PAGE.ADD.insert_url_tab'),
        },
        {
          component: <InsertSiteMap darkTheme={theme} register={register} errors={errors} onSubmit={triggerSubmit} />,
          eventKey: "tab2",
          title: t('PAGES_PAGE.ADD.insert_sitemap_tab'),
        },
        {
          component: <InsertCrawling darkTheme={theme} register={register} errors={errors} onSubmit={triggerSubmit} />,
          eventKey: "tab3",
          title: t('PAGES_PAGE.ADD.crawling_tab'),
        },
      ]}
    />
  );

  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1>{t('PAGES_PAGE.ADD.title')}</h1>

      <form className="bg-white" onSubmit={handleSubmit(onSubmit)}>
        <p>Nesta pagina e possivel adicionar amostras de paginas a um sitio web. Existem 3 metodos para adicionar paginas a um sitio web.</p>

        <h2>Metodos de adicionar paginas a um sitio web:</h2>
        <ul className="list-style-disc" style={{ listStyleType: "disc" }}>
          <li>Submeter manualmente uma lista de URLs;</li>
          <li>Submeter um ficheiro em formato sitemap;</li>
          <li>Solicitar crawling ao sitio web.</li>
        </ul>
        <div>
          <h2 className="mb-4">
            1. Em que sitio web pretende efetuar a adicao de paginas?
          </h2>
          <div className="w-50">
            <MultiSelect
              id="websites"
              darkTheme={theme}
              label="Sitio web (URL inicial):"
              options={websites}
              value={selectedWebsites}
              onChange={(selected) => setSelectedWebsites(selected)}
              onInputChange={(inputValue) => setSearchTerm(inputValue)}
              placeholder={websitesLoading ? "A carregar sitios web..." : "Digite para pesquisar sitios web..."}
              isLoading={websitesLoading}
              isMulti={true}
              isSearchable={true}
              filterOption={null}
              noOptionsMessage={({ inputValue }) => 
                inputValue ? `Nenhum sitio web encontrado para "${inputValue}"` : "Digite para pesquisar sitios web"
              }
              loadingMessage={() => "A pesquisar..."}
              menuIsOpen={searchTerm.length > 0 || selectedWebsites.length > 0 || websites.length > 0}
            />
            {selectedWebsites.length === 0 && (
              <small className="text-danger">
                <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />
              </small>
            )}
          </div>
        </div>

        <div className=" mt-5">
          <h2 className="mb-4">
            2. De que forma deseja adicionar as novas paginas?
          </h2>
          <p>Selecione apenas um dos processos abaixo:</p>
          <div className="mt-5">{TabsWithComponenets}</div>
        </div>
      </form>

      <Modal
        title="Adicionar paginas"
        onClose={handleModalClose}
        isOpen={feedbackMessage !== ""}
      >
        <p>{feedbackMessage}</p>
        <Button
          text="Fechar"
          variant="primary"
          darkTheme={theme}
          onClick={handleModalClose}
        />
      </Modal>
      
      <CrawlingModal
        isOpen={showCrawlingModal}
        onRequestClose={() => setShowCrawlingModal(false)}
        onSubmit={handleCrawling}
        theme={theme}
        selectedItems={selectedWebsites.map(website => ({ id: website.value }))}
        itemType="websites"
      />
    </div>
  );
};

export default PageCreateForm;
