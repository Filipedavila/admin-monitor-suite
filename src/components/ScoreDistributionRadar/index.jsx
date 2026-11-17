import { useMemo } from "react";
import { Radar } from "react-chartjs-2";
import { SortingTable, Tabs } from "@a12e/accessmonitor-ds";

/**
 * "Mancha gráfica da acessibilidade" built from the `scoreDistributionFrequency`
 * array returned by the analytics endpoints (one frequency per score range).
 * `dataListBar` is the list produced by buildScopedAnalyticsView /
 * buildGlobalAnalyticsView: [{ range, frequency, frequency_percent, ... }].
 */
export function ScoreDistributionRadar({ dataListBar = [], theme, caption, label = "Frequência (nº de páginas)" }) {
  const isLight = theme === "light";

  // Position in the array is the score (the last bucket also holds 10).
  const tableRows = useMemo(() => dataListBar.map((item, index) => ({ ...item, score: String(index) })), [dataListBar]);

  const hasData = dataListBar.some((item) => Number(item.frequency) > 0);

  const radarData = useMemo(() => ({
    labels: dataListBar.map((_, index) => String(index)),
    datasets: [{
      label,
      data: dataListBar.map((item) => Number(item.frequency) || 0),
      backgroundColor: "rgba(255, 136, 136, 0.4)",
      borderColor: "rgba(255, 136, 136, 1)",
      borderWidth: 2,
      pointBackgroundColor: "rgba(255, 136, 136, 1)",
      pointRadius: 4,
    }],
  }), [dataListBar, label]);

  const radarOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { labels: { color: isLight ? "black" : "white" } },
    },
    scales: {
      r: {
        beginAtZero: true,
        suggestedMin: 0,
        pointLabels: { display: true, color: isLight ? "black" : "white" },
        ticks: { color: isLight ? "black" : "white", backdropColor: "transparent", precision: 0 },
        grid: { color: isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)" },
        angleLines: { color: isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)" },
      },
    },
  }), [isLight]);

  if (!hasData) {
    return <p className="text-muted">Sem dados disponíveis para a mancha gráfica.</p>;
  }

  return (
    <Tabs
      defaultActiveKey="chart"
      darkTheme={theme}
      tabs={[
        {
          eventKey: "chart",
          title: "Gráfico",
          component: (
            <div style={{ display: "flex", justifyContent: "center", width: "100%", maxWidth: "600px", margin: "0 auto" }}>
              <Radar
                role="img"
                aria-label="Gráfico de Radar mostrando a distribuição de pontuações de acessibilidade por nota"
                data={radarData}
                options={radarOptions}
              />
            </div>
          ),
        },
        {
          eventKey: "table",
          title: "Tabela",
          component: (
            <SortingTable
              darkTheme={theme}
              hasSort={false}
              pagination={false}
              caption={caption}
              headers={[[
                { type: "Text", nRow: 1, name: "Nota", property: "score" },
                { type: "Text", nRow: 1, name: "Frequência", property: "frequency", justifyCenter: true },
                { type: "Text", nRow: 1, name: "Frequência (%)", property: "frequency_percent", justifyCenter: true },
              ]]}
              dataList={tableRows}
              columnsOptions={{
                score: { type: "Text", center: true, bold: false },
                frequency: { type: "Text", center: true, bold: false },
                frequency_percent: { type: "Text", center: true, bold: false },
              }}
            />
          ),
        },
      ]}
    />
  );
}

export default ScoreDistributionRadar;
