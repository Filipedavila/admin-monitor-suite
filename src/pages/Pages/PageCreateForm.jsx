import React, { useRef, useCallback } from "react";
import qs from "qs";
import { Button, Select, Breadcrumb, Tabs } from "@a12e/accessmonitor-ds";
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
import { createPages, createPagesFromSitemap } from "../../services/pages";
import { crawlWebsites } from "../../services/discovery";

const PageCreateForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [breadcrumbs] = React.useState([
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
  const selectedWebsitesRef = useRef([]);
  const webSearchTimeoutRef = useRef(null);
  const [activeTab, setActiveTab] = React.useState("tab1");
  const [feedbackMessage, setFeedbackMessage] = React.useState("");
  const [showCrawlingModal, setShowCrawlingModal] = React.useState(false);
  const [shouldClearForm, setShouldClearForm] = React.useState(false);

  const fetchWebsites = useCallback(async (search = '') => {
    const searchTerm = typeof search === 'string' ? search : '';
    setWebsitesLoading(true);
    try {
      const queryObj = { pagination: { limit: 20, page: 1 } };
      if (searchTerm) queryObj.filters = { searchTerm };
      const query = qs.stringify(queryObj);
      const response = await api.get(`/websites?${query}`);
      const fetched = response.data.data.map(item => ({
        value: item.id,
        label: `${item.title} (${item.baseUrl})`,
        startingUrl: item.baseUrl,
        name: item.title,
      }));
      setWebsites(fetched);
    } catch (error) {
      console.error('Error fetching websites:', error);
    } finally {
      setWebsitesLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchWebsites('');
  }, [fetchWebsites]);



  const onSubmit = (data) => {
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
      const response = await createPages(selectedWebsites, urls);
      
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

  const handleInsertSiteMap = async () => {
    
    if (selectedWebsites.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sitio web.");
      return;
    }

    const fileInput = document.getElementById('sitemap');
 
    
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setFeedbackMessage("Por favor, selecione um ficheiro sitemap.");
      return;
    }

    const file = fileInput.files[0];
    if (!/\.(xml|txt)$/i.test(file.name)) {
      setFeedbackMessage("Formato invalido. Use um ficheiro .xml ou .txt.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFeedbackMessage("O ficheiro excede o limite de 5MB.");
      return;
    }

    const ids = Array.isArray(selectedWebsites) ? selectedWebsites : [selectedWebsites];
    const results = await Promise.allSettled(ids.map((id) => createPagesFromSitemap(id, file)));
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length === 0) {
      setFeedbackMessage("Sitemap enviado com sucesso. As paginas serao criadas e avaliadas em segundo plano.");
      setShouldClearForm(true); // Mark form to be cleared when modal closes
    } else {
      failed.forEach((r) => console.error("Error adding sitemap pages:", r.reason));
      const status = failed[0].reason?.response?.status;
      setFeedbackMessage(
        status === 400
          ? "Ficheiro invalido: confirme o formato (.xml ou .txt), o tamanho (max. 5MB) e o conteudo do sitemap."
          : status === 404
            ? "Sitio web nao encontrado."
            : `Erro ao adicionar paginas do sitemap em ${failed.length} de ${ids.length} sitio(s) web.`
      );
    }
  };

  const handleCrawling = async () => {
    if (selectedWebsites.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sitio web para fazer crawling.");
      return;
    }
    
    // O Select de pesquisa devolve o id do sítio web escolhido. O crawl é o pedido
    // "Discovery > Crawl Website" (POST /discovery { websitesId }); POST /discovery/:id
    // é o crawl de uma categoria e não pode ser usado aqui.
    const websitesIds = Array.isArray(selectedWebsites) ? selectedWebsites : [selectedWebsites];

    try {
      const response = await crawlWebsites(websitesIds);

      if (response.status === 201 || response.status === 200) {
        setFeedbackMessage("O crawling foi iniciado com sucesso! O processo sera executado em segundo plano.");
        setSelectedWebsites([]);
        setShowCrawlingModal(false);
      } else {
        setFeedbackMessage("Erro ao iniciar o crawling. Tente novamente.");
      }
    } catch {
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
            <Select
              id="websites"
              darkTheme={theme}
              label="Sitio web (URL inicial):"
              options={websites}
              value={selectedWebsites}
              isSearch={true}
              isLoading={websitesLoading}
              noOptionsMessage={() => "Nenhum sítio web encontrado"}
              loadingMessage={() => "A pesquisar..."}
              onChange={(value) => {
                setSelectedWebsites(value);
                selectedWebsitesRef.current = value || [];
              }}
              onInputChange={(e) => {
                const inputValue = typeof e === "string" ? e : (e?.target?.value ?? "");
                if (webSearchTimeoutRef.current) clearTimeout(webSearchTimeoutRef.current);
                webSearchTimeoutRef.current = setTimeout(() => {
                  fetchWebsites(inputValue);
                }, 300);
              }}
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
        selectedItems={selectedWebsites}
        itemType="websites"
      />
    </div>
  );
};

export default PageCreateForm;
