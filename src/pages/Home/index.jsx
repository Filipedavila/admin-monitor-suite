import React, { useState } from "react";
import { Card, Button, Breadcrumb } from "ama-design-system";
import { Link } from "react-router-dom";
import CardAvaliation from "../../components/CardAvaliation";
import "./style.home.css";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from 'react-i18next';

const Home = () => {
    const breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },


    ];
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [cards, setCards] = useState({
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
                            itemsList={cards.itemsList}
                            darkTheme={theme === 'dark'}
                        />
                </div>

                <h2 className="text-start">{t('HOME_PAGE.observatory')}</h2>
                <div className="d-flex flex-grow-1 flex-wrap">
                <Card
                    itemsList={cards.itemsList.filter(card => card.title !== t('CATEGORIES_PAGE.LIST.title'))}
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
                />
                <CardAvaliation
                    title="AccessMonitor"
                    description="A informação abaixo é gerada em tempo real sempre que um qualquer utilizador solicita uma avaliação em https://accessmonitor.acessibilidade.gov.pt"
                    darkTheme={theme}
                />
                <CardAvaliation
                    title="MyMonitor"
                    description="A informação abaixo é gerada em tempo real sempre que um qualquer utlizador MyMonitor produz avaliações em https://mymonitor.acessibilidade.gov.pt."
                    darkTheme={theme}
                />
            </div>

            <div className="mt-4 d-flex flex-column gap-4 justify-content-between">
                <div className="cards-sync gap-4 p-4">
                    <div>
                        <h2 className="mb-4">Sincronização de dados estatísticos globais com o Observatório</h2>
                        <p>A informação processada no AMS (back office) é sincronizada com o Observatório público todos os dias à meia-noite. Este processo atualiza toda a informação pública registada no AMS com o Observatório. Por vezes é útil sincronizar a informação durante o dia. Para o efeito pressione o botão "sincronizar" que se encontra abaixo. A duração da sincronização depende do número de páginas, o que poderá levar vários minutos a concluir.</p>
                    </div>
                    <Button darkTheme={theme} text={"Sincronizar dados com o observatório"} ></Button>
                </div>

                <div className="cards-sync gap-4 p-4">
                    <div>
                        <h2 className="mb-4">Carregamento de dados de forma massiva</h2>
                        <p>Carregamento de dados no AMS de forma massiva através do carregamento de um ficheiro .CSV. O ficheiro deverá ter as seguintes colunas: diretoria, categoria, nome do sítio, url da homepage do sítio web.</p>
                    </div>
                    <Button darkTheme={theme} text={"Carregar CSV "} ></Button>
                </div>
            </div>

        </div>
    );
}

export default Home;

