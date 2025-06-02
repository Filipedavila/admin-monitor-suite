import React, { useState } from "react";
import { Card } from "ama-design-system";
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
        </div>
    );
}

export default Home;

