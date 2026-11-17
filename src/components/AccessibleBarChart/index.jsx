import { useRef, useState, useCallback, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import "./AccessibleBarChart.css";

function computeBarRects(chart, data) {
  const rects = [];
  const isHorizontal = chart.config.options?.indexAxis === 'y';

  data.datasets?.forEach((dataset, di) => {
    const meta = chart.getDatasetMeta(di);
    if (!meta?.data?.length) return;
    meta.data.forEach((element, i) => {
      if (!element) return;
      let left, top, width, height;
      if (isHorizontal) {
        const x = element.x ?? 0;
        const base = element.base ?? 0;
        const h = element.height ?? 20;
        left = Math.min(x, base);
        top = (element.y ?? 0) - h / 2;
        width = Math.abs(x - base);
        height = h;
      } else {
        const y = element.y ?? 0;
        const base = element.base ?? 0;
        const w = element.width ?? 20;
        left = (element.x ?? 0) - w / 2;
        top = Math.min(y, base);
        width = w;
        height = Math.abs(base - y);
      }
      rects.push({
        di, i,
        left: Math.max(0, left),
        top: Math.max(0, top),
        width: Math.max(width, 4),
        height: Math.max(height, 4),
      });
    });
  });

  return rects;
}

export function AccessibleBarChart({
  data,
  options,
  plugins: extraPlugins,
  ariaLabel,
  style,
  className,
  role: _role,
  ...props
}) {
  const chartRef = useRef(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const buttonRefs = useRef([]);
  const [barRects, setBarRects] = useState([]);

  const afterDrawPlugin = useMemo(() => ({
    id: 'barAccessPlugin',
    afterDraw(chart) {
      const next = computeBarRects(chart, dataRef.current);
      setBarRects(prev => {
        if (
          prev.length === next.length &&
          prev.every((r, i) =>
            r.left === next[i].left && r.top === next[i].top &&
            r.width === next[i].width && r.height === next[i].height
          )
        ) return prev;
        return next;
      });
    },
  }), []);

  const allPlugins = useMemo(
    () => [afterDrawPlugin, ...(extraPlugins ?? [])],
    [afterDrawPlugin, extraPlugins]
  );

  const showBar = useCallback((di, i) => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.setActiveElements([{ datasetIndex: di, index: i }]);
    chart.tooltip.setActiveElements([{ datasetIndex: di, index: i }], { x: 0, y: 0 });
    chart.update('none');
  }, []);

  const clearBar = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.setActiveElements([]);
    chart.tooltip.setActiveElements([], { x: 0, y: 0 });
    chart.update('none');
  }, []);

  const getBarLabel = useCallback((di, i) => {
    const d = dataRef.current;
    const label = d.labels?.[i] ?? `Barra ${i + 1}`;
    const dataset = d.datasets?.[di];
    const value = dataset?.data?.[i] ?? '';
    const dsLabel = dataset?.label ?? '';
    return `${label}: ${value}${dsLabel ? ` — ${dsLabel}` : ''}`;
  }, []);

  const handleKeyDown = (e, flatIndex) => {
    const total = barRects.length;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      buttonRefs.current[(flatIndex + 1) % total]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      buttonRefs.current[(flatIndex - 1 + total) % total]?.focus();
    }
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{ position: 'relative', width: '100%', ...style }}
      className={className}
    >
      <Bar
        ref={chartRef}
        data={data}
        options={options}
        plugins={allPlugins}
        aria-hidden="true"
        {...props}
      />
      {barRects.map(({ di, i, left, top, width, height }, flatIndex) => (
        <button
          key={`bar-${di}-${i}`}
          ref={el => { buttonRefs.current[flatIndex] = el; }}
          className="chart-bar-btn"
          tabIndex={0}
          aria-label={getBarLabel(di, i)}
          onFocus={() => showBar(di, i)}
          onBlur={clearBar}
          onKeyDown={e => handleKeyDown(e, flatIndex)}
          style={{ left, top, width, height }}
        />
      ))}
    </div>
  );
}
