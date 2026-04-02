import React, { useState, useEffect } from "react";
import { Card, Button, Breadcrumb, Input } from "@a12e/accessmonitor-ds";
import { Link } from "react-router-dom";
import CardAvaliation from "../../components/CardAvaliation";
import "./style.home.css";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from 'react-i18next';
import { api } from "../../config/api";
import { Modal } from "../../components/Modal";

const Home = () => {
    const breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
    ];

    useEffect(() => {
        const fetchData = async () => {
            const responseObservatoryData = await api.get('/admin/stats/observatory');
            const responseAMSData = await api.get('/admin/stats/totals');
            const responseMyMonitorData = await api.get('/admin/stats/mymonitor');
            setCardsAMS({
                itemsList: [
                    { title: t('DIRECTORIES_PAGE.LIST.title_list'), subtitle: responseAMSData.data.result.directories, icon: "AMA-Pasta-Line" },
                    { title: t('CATEGORIES_PAGE.LIST.title'), subtitle: responseAMSData.data.result.tags, icon: "AMA-Pasta-Line" },
                    { title: t('WEBSITES_PAGE.LIST.title_list'), subtitle: responseAMSData.data.result.websites, icon: "AMA-Pasta-Line" },
                    { title: t('PAGES_PAGE.LIST.title'), subtitle: responseAMSData.data.result.pages, icon: "AMA-Pasta-Line" },
                    { title: t('ENTITIES_PAGE.LIST.title'), subtitle: responseAMSData.data.result.entities, icon: "AMA-Pasta-Line" },
                    { title: t('USERS_PAGE.LIST.title'), subtitle: responseAMSData.data.result.users, icon: "AMA-Pasta-Line" },
                 ]
              });
            setCardsObservatory({
                itemsList: [
                    { title: t('DIRECTORIES_PAGE.LIST.title_list'), subtitle: responseObservatoryData.data.result.directories, icon: "AMA-Pasta-Line" },
                    { title: t('CATEGORIES_PAGE.LIST.title'), subtitle: responseObservatoryData.data.result.tags, icon: "AMA-Pasta-Line" },
                    { title: t('WEBSITES_PAGE.LIST.title_list'), subtitle: responseObservatoryData.data.result.websites, icon: "AMA-Pasta-Line" },
                    { title: t('PAGES_PAGE.LIST.title'), subtitle: responseObservatoryData.data.result.pages, icon: "AMA-Pasta-Line" },
                    { title: t('ENTITIES_PAGE.LIST.title'), subtitle: responseObservatoryData.data.result.entities, icon: "AMA-Pasta-Line" },
                ]
              });
              setCardsMyMonitor({
                itemsList: [
                    { title: t('USERS_PAGE.LIST.title'), subtitle: responseMyMonitorData.data.result.users, icon: "AMA-Pasta-Line" },
                    { title: t('WEBSITES_PAGE.LIST.title_list'), subtitle: responseMyMonitorData.data.result.websites, icon: "AMA-Pasta-Line" },
                    { title: t('PAGES_PAGE.LIST.title'), subtitle: responseMyMonitorData.data.result.pages, icon: "AMA-Pasta-Line" },
                ]
              });

              const [responseAMS, responseMyMonitor, responseAccessMonitor, responseAMSWaiting, responseAMSError, responseAMSEvaluating, responseAcessEvaluating, responseAcessWaiting, responseAcessError] = await Promise.all([
                api.get('/evaluation/ams/counter'),
                api.get('/evaluation/mm/counter'),
                api.get('/evaluation/am/counter'),
                api.get('/page/evaluationList/admin/waiting'),
                api.get('/page/evaluationList/admin/error'),
                api.get('/page/evaluationList/admin/evaluating'),
                api.get('/page/evaluationList/user/evaluating'),
                api.get('/page/evaluationList/user/waiting'),
                api.get('/page/evaluationList/user/error')
              ]);

              setDataAMS({
                counter: responseAMS.data.result.counter,
                date: responseAMS.data.result.date,
                waiting: responseAMSWaiting.data.result,
                error: responseAMSError.data.result,
                evaluating: responseAMSEvaluating.data.result
              });
              setDataMyMonitor({
                counter: responseMyMonitor.data.result.counter,
                date: responseMyMonitor.data.result.date,
                waiting: responseAcessWaiting.data.result,
                error: responseAcessError.data.result,
                evaluating: responseAcessEvaluating.data.result
              });
              setDataAccessMonitor({
                counter: responseAccessMonitor.data.result.counter,
                date: responseAccessMonitor.data.result.date,
                waiting: responseAcessWaiting.data.result,
                error: responseAcessError.data.result,
                evaluating: responseAcessEvaluating.data.result
              });

   
       
        };
        fetchData();
    }, []);

    const handleResetAMS = async () => {
        const response = await api.get('/evaluation/admin/reset');
        if (response.status === 200) {
            setMessageModal("Lista de avaliações reiniciada com sucesso. Por favor, aguarde um momento.");
            setIsSyncWithObservatoryModalOpen(true);
        } else {
            setMessageModal("Ocorreu um erro ao resetar o AMS. Por favor, tente novamente.");
            setIsSyncWithObservatoryModalOpen(true);
        }
    }

    const handleResetMyMonitor = async () => {
        const response = await api.get('/evaluation/myMonitor/reset');
        if (response.status === 200) {
            setMessageModal("Lista de avaliações reiniciada com sucesso. Por favor, aguarde um momento.");
            setIsSyncWithObservatoryModalOpen(true);
        }
    }

    const handleDeleteAMS = async () => {
        const response = await api.get('/evaluation/admin/delete');
        if (response.status === 200) {
            setMessageModal("A Eliminar as listas de avaliações. Por favor, aguarde um momento.");
            setIsSyncWithObservatoryModalOpen(true);
        }
    }

    const handleDeleteMyMonitor = async () => {
        const response = await api.get('/evaluation/myMonitor/delete');
        if (response.status === 200) {
            setMessageModal("Lista de avaliações eliminada com sucesso. Por favor, aguarde um momento.");
            setIsSyncWithObservatoryModalOpen(true);
        }
    }
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [isSyncWithObservatoryModalOpen, setIsSyncWithObservatoryModalOpen] = useState(false);
    const [isUploadCSVModalOpen, setIsUploadCSVModalOpen] = useState(false);
    const [messageModal, setMessageModal] = useState("");
    const [isUploadingCSV, setIsUploadingCSV] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dataAMS, setDataAMS] = useState({
        counter: 0,
        date: new Date()
    });
    const [dataMyMonitor, setDataMyMonitor] = useState({
        counter: 0,
        date: new Date()
    });
    const [dataAccessMonitor, setDataAccessMonitor] = useState({
        counter: 0,
        date: new Date()
    });
    const [cardsObservatory, setCardsObservatory] = useState({
        itemsList: [
        {
            title: t('DIRECTORIES_PAGE.LIST.title_list'),
            subtitle: "37",
            icon: "AMA-Pasta-Line", 
        },
        {
            title: t('USERS_PAGE.LIST.title'),
            subtitle: "12",
            icon: "AMA-Pasta-Line",
        },
        {
            title: t('ENTITIES_PAGE.LIST.title'),
            subtitle: "3",
            icon: "AMA-Pasta-Line",
        },
        {
            title: t('WEBSITES_PAGE.LIST.title_list'),
            subtitle: "3",
            icon: "AMA-Pasta-Line",
        }
        ],
        darkTheme: false,
});

    const [cardsAMS, setCardsAMS] = useState({
        itemsList: [{
            title: t('DIRECTORIES_PAGE.LIST.title_list'),
            subtitle: "37",
            icon: "AMA-Pasta-Line", 
        },
        {
            title: t('USERS_PAGE.LIST.title'),
            subtitle: "12",
            icon: "AMA-Pasta-Line",
        },
        {
            title: t('CATEGORIES_PAGE.LIST.title'),
            subtitle: "5",
            icon: "AMA-Pasta-Line",
        },
        {
            title: t('ENTITIES_PAGE.LIST.title'),
            subtitle: "3",
            icon: "AMA-Pasta-Line",
        },
        {
            title: t('WEBSITES_PAGE.LIST.title_list'),
            subtitle: "3",
            icon: "AMA-Pasta-Line",
        }
        
    ],
    darkTheme: false,
    });

    const [cardsMyMonitor, setCardsMyMonitor] = useState({
        itemsList: [{
            title: t('USERS_PAGE.LIST.title'),
            subtitle: "12",
            icon: "AMA-Pasta-Line",

        },
        {
            title: t('WEBSITES_PAGE.LIST.title_list'),
            subtitle: "3",
            icon: "AMA-Pasta-Line",

        },
        {
            title: t('PAGES_PAGE.LIST.title'),
            subtitle: "3",
            icon: "AMA-Pasta-Line",

        }
        ],
        darkTheme: false,

    });

    const handleSyncWithObservatory = async () => {
        const response = await api.post('/observatory/generate');
        if (response.status === 201) {
            setMessageModal("A sincronização de dados com o Observatório está a ser processada. Por favor, aguarde um momento.");
            setIsSyncWithObservatoryModalOpen(true);
        } else {
            setMessageModal("Ocorreu um erro ao sincronizar dados com o Observatório. Por favor, tente novamente.");
            setIsSyncWithObservatoryModalOpen(false);
        }
    }

    const handleUploadCSV = async (e) => {
        const file = e.target.files[0];
        
        // File validation
        if (!file) {
            setMessageModal("Por favor, selecione um ficheiro.");
            return;
        }

        // Check file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
            setMessageModal("Por favor, selecione apenas ficheiros CSV (.csv).");
            return;
        }

        try {
            setIsUploadingCSV(true);
            setUploadProgress(0);
            setMessageModal("A carregar ficheiro...");

            const formData = new FormData();
            formData.append('file', file);

            // Upload with progress tracking
            const response = await api.post('/admin/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                }
            });

            if (response.status === 200 || response.status === 201) {
                setMessageModal(`O ficheiro "${file.name}" foi carregado com sucesso. ${response.data.message || ''}`);
                setUploadProgress(100);
                
                // Clear the file input
                e.target.value = '';
            } else {
                throw new Error(response.data?.message || 'Erro desconhecido');
            }
        } catch (error) {
            console.error('Upload error:', error);
            
            let errorMessage = "Ocorreu um erro ao carregar o ficheiro.";
            
            if (error.response) {
                // Server responded with error status
                errorMessage = error.response.data?.message || 
                             error.response.data?.error || 
                             `Erro do servidor: ${error.response.status}`;
            } else if (error.request) {
                // Network error
                errorMessage = "Erro de rede. Verifique a sua ligação à internet.";
            } else {
                // Other error
                errorMessage = error.message || errorMessage;
            }
            
            setMessageModal(errorMessage + " Por favor, tente novamente.");
        } finally {
            setIsUploadingCSV(false);
        }
    }

    return (
        <div className="main-content-home">

            <div>
                <h1>Dados operacionais do Ecossistema AccessMonitor</h1>
                <Breadcrumb data={breadcrumbs} />
                <p>Encontra nesta página a síntese dos registos efetuados, em tempo real, pelas diversas aplicações do Ecossistema AccessMonitor.
                </p>
            </div>

            <div className="cards-dashboard p-4 bg-white">
                <h2>Síntese da informação registada
                    Observatório vs AdminMonitorSuite</h2>
                <p>O quadro abaixo sintetiza a informação publicada no Observatório de sítios web <a href="https://observatorio.acessibilidade.gov.pt" target="_blank" rel="noopener noreferrer">https://observatorio.acessibilidade.gov.pt</a> e registada no AdminMonitorSuite de sítios web. Note que nem toda a informação registada no AMS é pública.</p>
                <h2 className="text-start">AMS</h2>
                <div className="d-flex flex-grow-1 flex-wrap">

                        <Card
                            itemsList={cardsAMS.itemsList}
                            darkTheme={theme === 'dark'}
                        />
                </div>

                <h2 className="text-start">{t('HOME_PAGE.observatory')}</h2>
                <div className="d-flex flex-grow-1 flex-wrap">
                <Card
                    itemsList={cardsObservatory.itemsList}
                    darkTheme={theme === 'dark'}
                />
                </div>
                <h2 className="text-start">MyMonitor</h2>
                <div className="d-flex flex-grow-1 flex-wrap gap-2">
                    <Card
                        itemsList={cardsMyMonitor.itemsList}
                        darkTheme={theme === 'dark'}
                    />
                </div>
            </div>

            <div className="d-flex gap-4 mt-4 flex-column justify-content-between">
                <CardAvaliation
                    title="AdminMonitorSuite (AMS)"
                    description="A informação abaixo é gerada em tempo real sempre que um elemento da equipa AMA (utilizador AMS) solicita uma avaliação no AMS."
                    darkTheme={theme}
                    data={dataAMS}
                    handleReset={handleResetAMS}
                    handleCancel={handleDeleteAMS}
                    hasNoButtons={false}
                />
                <CardAvaliation
                    title="AccessMonitor"
                    description="A informação abaixo é gerada em tempo real sempre que um qualquer utilizador solicita uma avaliação em https://accessmonitor.acessibilidade.gov.pt"
                    darkTheme={theme}
                    data={dataAccessMonitor}
                    handleReset={()=>{}}
                    handleCancel={()=>{}}
                    hasNoButtons={true}
                />
                <CardAvaliation
                    title="MyMonitor"
                    description="A informação abaixo é gerada em tempo real sempre que um qualquer utlizador MyMonitor produz avaliações em https://mymonitor.acessibilidade.gov.pt."
                    darkTheme={theme}
                    data={dataMyMonitor}
                    handleReset={handleResetMyMonitor}
                    handleCancel={handleDeleteMyMonitor}
                    hasNoButtons={false}
                />
            </div>

            <div className="mt-4 d-flex flex-column gap-4 justify-content-between">
                <div className="cards-sync gap-4 p-4">
                    <div>
                        <h2 className="mb-4">Sincronização de dados estatísticos globais com o Observatório</h2>
                        <p>A informação processada no AMS (back office) é sincronizada com o Observatório público todos os dias à meia-noite. Este processo atualiza toda a informação pública registada no AMS com o Observatório. Por vezes é útil sincronizar a informação durante o dia. Para o efeito pressione o botão "sincronizar" que se encontra abaixo. A duração da sincronização depende do número de páginas, o que poderá levar vários minutos a concluir.</p>
                    </div>
                    <Button onClick={handleSyncWithObservatory} darkTheme={theme} text={"Sincronizar dados com o observatório"} ></Button>
                </div>

                <div className="cards-sync gap-4 p-4">
                    <div>
                        <h2 className="mb-4">Carregamento de dados de forma massiva</h2>
                        <p>Carregamento de dados no AMS de forma massiva através do carregamento de um ficheiro .CSV. O ficheiro deverá ter as seguintes colunas: diretoria, categoria, nome do sítio, url da homepage do sítio web.</p>
                        <p><strong>Por favor, no servidor de Produção (AMS PROD) não executem, nem sequer tentem , esta funcionalidade. Ela ainda está em fase de teste!!</strong></p>                     
                    </div>
                    <Button darkTheme={theme} onClick={() => {
                        setIsUploadCSVModalOpen(true);
                        setMessageModal("");
                        setUploadProgress(0);
                        setIsUploadingCSV(false);
                    }} text={"Carregar CSV "} ></Button>
                </div>
            </div>

            <Modal
                title="Informação"
                isOpen={isSyncWithObservatoryModalOpen}
                onClose={() => setIsSyncWithObservatoryModalOpen(false)}
            >
                <p>{messageModal}</p>
                <Button onClick={() => setIsSyncWithObservatoryModalOpen(false)} darkTheme={theme} text={"Fechar"} ></Button>
            </Modal>

            <Modal
                title="Carregamento de dados de forma massiva"
                isOpen={isUploadCSVModalOpen}
                onClose={() => !isUploadingCSV && setIsUploadCSVModalOpen(false)}
            >
                <div className="upload-csv-modal">
                    <p>Carregamento de dados de forma massiva através de ficheiro CSV.</p>
                    <p><small>Formato suportado: .csv</small></p>
                    <p><small>Colunas necessárias: diretoria, categoria, nome do sítio, url da homepage do sítio web</small></p>
                    
                    <div className="mt-3 mb-3">
                        <Input 
                            type="file" 
                            accept=".csv"
                            onChange={handleUploadCSV}
                            disabled={isUploadingCSV}
                        />
                    </div>

                    {isUploadingCSV && (
                        <div className="upload-progress mb-3">
                            <div className="progress-bar-container" style={{ 
                                width: '100%', 
                                height: '20px', 
                                backgroundColor: '#f0f0f0', 
                                borderRadius: '10px',
                                overflow: 'hidden',
                                marginBottom: '10px'
                            }}>
                                <div 
                                    className="progress-bar" 
                                    style={{ 
                                        width: `${uploadProgress}%`, 
                                        height: '100%', 
                                        backgroundColor: theme === 'dark' ? '#4CAF50' : '#007bff',
                                        transition: 'width 0.3s ease',
                                        borderRadius: '10px'
                                    }}
                                ></div>
                            </div>
                            <small>{uploadProgress}% carregado</small>
                        </div>
                    )}

                    {messageModal && (
                        <div className="upload-message mb-3">
                            <p style={{ 
                                color: messageModal.includes('sucesso') ? 'green' : 
                                       messageModal.includes('erro') || messageModal.includes('Erro') ? 'red' : 
                                       '#666'
                            }}>
                                {messageModal}
                            </p>
                        </div>
                    )}

                    <div className="modal-actions">
                        <Button 
                            onClick={() => setIsUploadCSVModalOpen(false)} 
                            darkTheme={theme} 
                            text={isUploadingCSV ? "A carregar..." : "Fechar"}
                            disabled={isUploadingCSV}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Home;

