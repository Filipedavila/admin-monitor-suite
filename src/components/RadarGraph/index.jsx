// RadarGraph.jsx
import React, { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import { Tabs, SortingTable } from '@a12e/accessmonitor-ds';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export const RadarGraph = ({ websites = [], darkTheme, showTabs = true, labelDataSet = "Distribuição de Pontuações" }) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const currentTheme = darkTheme || theme;

    // Prepare radar chart data
    const generateLabels = () => {
      
        if (websites && websites.length > 0) {
            return websites.map(website => {
                // Check if this is for pages (based on labelDataSet)
                if (labelDataSet === "Pontuação por página") {
                    return website.domain.split('/').slice(3).join('/');
                } else {
                 
                    return  website.domain || website.url || website.name || website.Name;
                }
            });
        }
        // Fallback to empty labels if no websites data
        return new Array(websites.length).fill('');
    };

    const mockRadarData = {
        type: 'radar',
        labels: generateLabels(),
        datasets: [
            {
                label: labelDataSet,
                data: websites?.map(item => Number(item.averageScore || item.score)) || [],
                backgroundColor: 'rgba(255, 136, 136, 0.4)',
                borderColor: 'rgba(255, 136, 136, 1)',
                borderWidth: 2,
                fill: 'origin',
                pointBackgroundColor: 'rgba(255, 136, 136, 1)',
                pointBorderColor: 'rgba(255, 136, 136, 1)',
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0,
                color: currentTheme === "light" ? "black" : 'white',
            },
        ],
    };

    const mockRadarOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: currentTheme === "light" ? "black" : 'white',
                }
            },
            tooltip: {
                callbacks: {
                    title: function(context) {
                        // Show the label (point name) in the tooltip title
                        return context[0].label;
                    },
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.r}`;
                    }
                }
            },
            filler: {
                propagate: false
            }
        },
        scales: {
            r: {
                beginAtZero: true,
                suggestedMin: 0,
                suggestedMax: 10,
                pointLabels: {
                    display: false, // Hide point labels by default
                    color: currentTheme === "light" ? "black" : 'white',
                    font: {
                        size: 12
                    }
                },
                grid: {
                    color: currentTheme === "light" ? "rgba(0,0,0,0.1)" : 'rgba(255,255,255,0.1)',
                },
                angleLines: {
                    color: currentTheme === "light" ? "rgba(0,0,0,0.1)" : 'rgba(255,255,255,0.1)',
                },
                ticks: {
                    color: currentTheme === "light" ? "black" : 'white',
                    backdropColor: 'transparent'
                }
            }
        },
        elements: {
            line: { 
                borderWidth: 2,
                fill: true
            },
            point: {
                radius: 4,
                hoverRadius: 6
            }
        }
    };

    // Prepare table data from websites data
    const tableData = useMemo(() => {
        if(labelDataSet === "Pontuação por página") {
            return websites;
        }
        if (!websites || websites.length === 0) return [];
        
        // Process websites data to show domain and average score
        const websiteData = websites.map(website => {
            // Extract domain from URL
            let domain =  website.StartingUrl || website.name || website.url || website.domain;
            

            let averageScore;
            if (website.averageScore !== undefined) {
                averageScore = Number(website.averageScore).toFixed(1);
            } else if (website.pages && website.pages.length > 0) {
                const scores = website.pages
                    .filter(page => page.score !== undefined && page.score !== null)
                    .map(page => Number(page.score));
                if (scores.length > 0) {
                    const sum = scores.reduce((acc, score) => acc + score, 0);
                    averageScore = (sum / scores.length).toFixed(1);
                }
            } else if (website.score !== undefined) {
                averageScore = Number(website.score).toFixed(1);
            }

            return {
                domain: domain,
                averageScore: averageScore
            };
        });
        return websiteData;
    }, [websites]);

    // Table headers
    const tableHeaders = [
        [
            { type: "Text", justifyCenter: false, bigWidth:"70%", name: labelDataSet === "Pontuação por página" ?  "Página" : labelDataSet === "Pontuação por diretório" ? "Diretório" : "Sítio web (domínio)", property: "domain" },
            { type: "Text", justifyCenter: true, bigWidth:"30%", name: "Pontuação média", property: "averageScore" }
        ]
    ];

    // Table column options
    const columnsOptions = {
        domain: { type: "Link", center: false, bold: false, href: (row) => row.domain },
        averageScore: { type: "Text", center: true, bold: false }
    };

    // Radar chart component
    const RadarChart = () => (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <Radar
                role="img"
                aria-label="Gráfico de Radar mostrando a distribuição de pontuações de acessibilidade"
                data={mockRadarData}
                options={mockRadarOptions}
            />
        </div>
    );

    // Table component
    const ScoreTable = () => (
        <div style={{ width: '100%' }}>
            <SortingTable
                darkTheme={currentTheme}
                headers={tableHeaders}
                dataList={tableData}
                columnsOptions={columnsOptions}
                pagination={false}
                hasSort={false}
                caption={labelDataSet === "Pontuação por página" ? "Lista de páginas e suas pontuações médias de acessibilidade" : "Lista de sítios web e suas pontuações médias de acessibilidade"}
                setDataList={() => {}}
                nextPage={() => {}}
                itemsPaginationTexts={[]}
                nItemsPerPageTexts={[]}
                iconsAltTexts={[]}
                paginationButtonsTexts={[]}
                project=""
                setCheckboxesSelected={() => {}}
                ariaLabels={{ sortingTable: "Tabela de sítios web e pontuações médias" }}
            />
        </div>
    );

    // If showTabs is false, just return the radar chart
    if (!showTabs) {
        return <RadarChart />;
    }

    // Return tabs with radar chart and table
    const tabs = [
        {
            eventKey: "radar",
            title: "Gráfico Radar",
            component: <RadarChart />
        },
        {
            eventKey: "table",
            title: labelDataSet === "Pontuação por página" ? "Tabela de Páginas" : labelDataSet === "Pontuação por diretório" ? "Tabela de Diretórios" : "Tabela de Sítios Web", 
            component: <ScoreTable />
        }
    ];

    return (
        <div style={{ width: '100%' }}>
            <Tabs
                defaultActiveKey="radar"
                tabs={tabs}
            />
        </div>
    );
};

export default RadarGraph;
