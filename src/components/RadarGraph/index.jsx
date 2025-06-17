// RadarGraphMock.jsx
import React from 'react';
import { Radar } from 'react-chartjs-2';

const theme = "light";
const mockRadarData = {
    labels: ['', '', '', '', '', '', '', '','', '', ''],
    datasets: [
        {
            label: 'Distribuição de Pontuações',
            data: [9, 8, 8, 5, 9,10,9,5,6,7,8 ],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
        },
    ],
};

const mockRadarOptions = {
    responsive: true,
    scales: {
        r: {
            min: 0,
            max: 10,
            grid: {
                color: theme === "light" ? "lightgrey" : 'lightgrey',
            },
            angleLines: {
                color: theme === "light" ? "lightgrey" : 'lightgrey',
            },
            ticks: {
                backdropColor: theme === "light" ? "transparent" : '#2c3241',
                color: theme === "light" ? "black" : 'white',
            },
        },
    },
    plugins: {
        legend: {
            display: true,
            position: 'top',
        },
    },
};

export const RadarGraph = () => {
    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <Radar 
                role="img"
                aria-label="Gráfico de Radar mostrando a distribuição de pontuações de acessibilidade"
                data={mockRadarData} 
                options={mockRadarOptions} 
            />
        </div>
    );
};

export default RadarGraph;
