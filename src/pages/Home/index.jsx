import React, { useState } from "react";
import { Card, Button } from "ama-design-system";
import "./style.home.css";
const Home = () => {
    const [cards, setCards] = useState([
        {
            title: "Diretórios",
            subtitle: "37",
            icon: "AMA-Pasta-Line",
            darkTheme: false,
        },
        {
            title: "Usuários",
            subtitle: "12",
            icon: "AMA-Pasta-Line",
            darkTheme: false,
        },
        {
            title: "Aplicações",
            subtitle: "5",
            icon: "AMA-Pasta-Line",
            darkTheme: false,
        },
        {
            title: "Servidores",
            subtitle: "3",
            icon: "AMA-Pasta-Line",
            darkTheme: false,
        },
        {
            title: "Servidores",
            subtitle: "3",
            icon: "AMA-Pasta-Line",
            darkTheme: false,
        }
    ]);
    return (
        <div className="main-content-home">
            <div>
                <h1>Bem vindo</h1>
                <p>Sumário das aplicações</p>
            </div>

            <div className="cards-dashboard">
                <h2 className="text-start">My Monitor</h2>
                <div className="d-flex gap-4 flex-grow-1 flex-wrap">

                {cards.map((card, index) => (
                    <Card
                    key={index}
                    title={card.title}
                        subtitle={card.subtitle}
                        icon={card.icon}
                        darkTheme={card.darkTheme}
                        />
                    ))}

                    </div>
                    <h2 className="text-start">Study Monitor</h2>

            <div className="d-flex gap-4 flex-grow-1 flex-wrap">

                {cards.map((card, index) => (
                    <Card
                    key={index}
                    title={card.title}
                    subtitle={card.subtitle}
                    icon={card.icon}
                    darkTheme={card.darkTheme}
                    />
                ))}
                </div>
            </div>

            <div className="cards-dashboard mt-5">
                <h2>Sincronização de dados estatísticos globais com o Observatório</h2>
                <p>A informação processada no AMS (back office) é sincronizada com o Observatório público todos os dias à meia-noite. Este processo atualiza toda a informação pública registada no AMS com o Observatório. Por vezes é útil sincronizar a informação durante o dia. Para o efeito pressione o botão "sincronizar" que se encontra abaixo. A duração da sincronização depende do número de páginas, o que poderá levar vários minutos a concluir.</p>
                <Button text={"Sincronizar dados com o observatório"} ></Button>
            </div>

            <div className="cards-dashboard mt-5">
                <h2>Carregamento de dados de forma massiva</h2>
                <p>Carregamento de dados no AMS de forma massiva através do carregamento de um ficheiro .CSV. O ficheiro deverá ter as seguintes colunas: diretoria, categoria, nome do sítio, url da homepage do sítio web.</p>
                <Button text={"Sincronizar dados com o observatório"} ></Button>
            </div>

            
        </div>
    );
}

export default Home;

