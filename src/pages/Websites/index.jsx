import React, { useState, useEffect } from "react";
import { Button, InputSearch, SortingTable, Breadcrumb, RadioGroup } from "ama-design-system";
import "./style.users.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { directoriesHeaders, dataRows, columnsOptions, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
import ContentListWebSites from "./components/ContentListWebSites.jsx";
import { useTranslation } from 'react-i18next';
import { api } from "../../config/api";
import moment from "moment";
import { Modal } from "../../components/Modal";
import { useTheme } from '../../context/ThemeContext';
import CrawlingModal from "../../components/CrawlingModal";

const WebSiteList = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [checkboxesSelected, setCheckboxesSelected] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showCrawlingModal, setShowCrawlingModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [radioValue, setRadioValue] = useState(1);
    const breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
        {
            title: "Sítio Web",
        }
    ];

    useEffect(() => {
        const currentPath = location.pathname;
        const lastPath = localStorage.getItem('currentPath');
        if (lastPath && lastPath !== currentPath) {
            localStorage.setItem('previousPath', lastPath);
        }
        localStorage.setItem('currentPath', currentPath);
    }, [location.pathname]);

    const handleSearchChange = (value) => {
        setSearch(value.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };
    const fetchData = async () => {
        const responseTotal = await api.get(`/website/all/count/search=${search}`);
        setTotalItems(Number(responseTotal.data.result));
        const offset = currentPage - 1;
        const response = await api.get(`/website/all/${itemsPerPage}/${offset}/sort=/direction=/search=${search}`);
        setData(response.data.result.map(item => ({
            id: item.WebsiteId,
            Name: item.Name,
            StartingUrl: item.StartingUrl,
            Pages: item.Pages + "(" + item.Evaluated_Pages + ")",
            Creation_Date: moment(item.Creation_Date).format('DD/MM/YYYY'),
            Declaration: item.Declaration === null ? "Não avaliado" : item.Declaration === 1 ? "Selo de Ouro" : item.Declaration === 2 ? "Selo de Prata" : item.Declaration === 3 ? "Selo de Bronze" : "Declaração não conforme",
            edit: "Editar",
        })));
    };
    // Fetch total count and current page data
    useEffect(() => {
    
        fetchData();
    }, [currentPage, itemsPerPage, search]);

    // Handle page change
    const handlePageChange = (page) => setCurrentPage(page);

    // Handle items per page change
    const handleItemsPerPageChange = (n) => {
        setItemsPerPage(n);
        setCurrentPage(1); // Reset to first page
    };

    const handleCrawlingWebsites = async ({ maxDepth, maxPages, waitJS, selectedItems }) => {
        if (selectedItems.length === 0) {
            setFeedbackMessage("Por favor, selecione pelo menos um sítio web para fazer crawling.");
            setShowFeedbackModal(true);
            return;
        }
        
        const websites = selectedItems.map(item => ({
            url: data.find(d => d.id === item.id).StartingUrl,
            websiteId: item.id
        }));
        
        try {
            const response = await api.post('/crawler/crawl', {
                websites: websites,
                maxDepth: maxDepth,
                maxPages: maxPages,
                waitJS: waitJS ? 1 : 0
            });
            
            if (response.status === 201 || response.status === 200) {
                setFeedbackMessage("O crawling foi iniciado com sucesso! O processo será executado em segundo plano.");
                setCheckboxesSelected([]);
                setShowCrawlingModal(false);
                await fetchData();
            }
        } catch (error) {
            setFeedbackMessage("Erro ao iniciar o crawling. Tente novamente.");
        }
        setShowFeedbackModal(true);
    };

    // Handle delete websites
    const handleDeleteWebsites = async () => {
        if (checkboxesSelected.length === 0) {
            setFeedbackMessage("Por favor, selecione pelo menos um sítio web para eliminar.");
            setShowFeedbackModal(true);
            return;
        }
        const websiteIds = checkboxesSelected.map(item => item.id);
        try {
            const response = await api.post('/website/deleteBulk', {
                websitesId: websiteIds
            });
            
            if (response.status === 201 || response.status === 200) {
                setFeedbackMessage("Sítios web eliminados com sucesso!");
                setCheckboxesSelected([]);
                await fetchData();
            }
        } catch (error) {
            setFeedbackMessage("Erro ao eliminar sítios web. Tente novamente.");
        }
        setShowFeedbackModal(true);
    };

    // Handle delete pages
    const handleDeletePagesWebsites = async () => {
        if (checkboxesSelected.length === 0) {
            setFeedbackMessage("Por favor, selecione pelo menos um sítio web para eliminar páginas.");
            setShowFeedbackModal(true);
            return;
        }
        const websiteIds = checkboxesSelected.map(item => item.id);
        try {
            const response = await api.post('/website/pages/deleteBulk', {
                websitesId: websiteIds
            });
            
            if (response.status === 201 || response.status === 200) {
                setFeedbackMessage("Páginas dos sítios web eliminadas com sucesso!");
                setCheckboxesSelected([]);
                setSearch("");
                await fetchData();
            }
        } catch (error) {
            setFeedbackMessage("Erro ao eliminar páginas dos sítios web. Tente novamente.");
        }
        setShowFeedbackModal(true);
    };

    // Handle re-evaluate websites
    const handleReevaluateWebsites = async () => {
        const websiteIds = checkboxesSelected.map(item => item.id);
        const reEvaluate = radioValue === "1" ? "all" : "observatory";
        try {
            const response = await api.post('/website/reEvaluate', {
                websitesId: websiteIds,
                option: reEvaluate
            });
            
            if (response.status === 201 || response.status === 200) {
                setFeedbackMessage("As páginas irão ser avaliadas em segundo plano, e a sua informação estará disponível assim que possível.");
                setCheckboxesSelected([]);
                setShowModal(false);
                setSearch("");
                fetchData();
            }
        } catch (error) {
            setFeedbackMessage("Erro ao iniciar reavaliação dos sítios web. Tente novamente.");
        }
        setShowFeedbackModal(true);
    };

    return (
        <div>
            <Breadcrumb data={breadcrumbs} />
            <h1>{t('WEBSITES_PAGE.LIST.title_list')}</h1>
            <p>Abaixo encontra a listagem de todos os sítios web registados no AdminMonitorSuite, num total de {totalItems} sítios web.</p>
            <div>
                <ContentListWebSites
                    title={t('WEBSITES_PAGE.LIST.subtitle_list')}
                    checkboxesSelected={checkboxesSelected}
                    setCheckboxesSelected={setCheckboxesSelected}
                    data={data}
                    setData={setData}
                    totalItems={totalItems}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    search={search}
                    handleSearchChange={handleSearchChange}
                    onDeleteWebsites={handleDeleteWebsites}
                    onDeletePagesWebsites={handleDeletePagesWebsites}
                    onReevaluateWebsites={() => setShowModal(true)}
                    onCrawlWebsites={() => setShowCrawlingModal(true)}
                    navigate={navigate}
                    setItemsPerPage={setItemsPerPage}
                />
            </div>
            <Modal
                isOpen={showModal}
                onRequestClose={() => setShowModal(false)}
                title={t('WEBSITES_PAGE.LIST.re_evaluate_websites')}
            >
                <p>Escolha que páginas quer reavaliar</p>
                <RadioGroup
                    darkTheme={theme}
                    data={[
                        {
                            id: '1',
                            name: "Todas as páginas"
                        },
                        {
                            id: '2',
                            name: "Apenas as páginas do observatório"
                        }
                    ]}
                    inline
                    onChange={(value) => setRadioValue(value)}
                    value={radioValue}
                    name="format"
                />
                <Button
                    darkTheme={theme}
                    text={t('WEBSITES_PAGE.LIST.re_evaluate_websites')}
                    icon={"AMA-Adicionar-Line"}
                    className="btn-primary"
                    onClick={handleReevaluateWebsites}
                />
            </Modal>
            <Modal
                isOpen={showFeedbackModal}
                onRequestClose={() => setShowFeedbackModal(false)}
                title="Sítios Web"
            >
                <p>{feedbackMessage}</p>
                <Button
                    darkTheme={theme}
                    text="OK"
                    className="btn-primary"
                    onClick={() => setShowFeedbackModal(false)}
                />
            </Modal>
            <CrawlingModal
                isOpen={showCrawlingModal}
                onRequestClose={() => setShowCrawlingModal(false)}
                onSubmit={handleCrawlingWebsites}
                theme={theme}
                selectedItems={checkboxesSelected}
                itemType="websites"
            />
        </div>
    )
}

export default WebSiteList;