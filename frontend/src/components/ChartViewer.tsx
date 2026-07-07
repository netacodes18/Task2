import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

interface ChartViewerProps {
  data: any[];
  fields: { name: string, dataTypeID: number }[];
}

export default function ChartViewer({ data, fields }: ChartViewerProps) {
  const chartConfig = useMemo(() => {
    if (!data || data.length === 0 || fields.length < 2) return null;

    // Very naive auto-detection: first column is X-axis (category/date), rest are numeric for Y-axis
    // In postgres: 20=int8, 21=int2, 23=int4, 700=float4, 701=float8, 1700=numeric
    const numericTypeIds = [20, 21, 23, 700, 701, 1700];
    
    let xAxisKey = fields[0].name;
    let yAxisKeys = fields.filter((f, idx) => idx > 0 && numericTypeIds.includes(f.dataTypeID)).map(f => f.name);
    
    // If we couldn't find a numeric by ID, just guess any field that's not the first
    if (yAxisKeys.length === 0) {
      yAxisKeys = fields.slice(1, 3).map(f => f.name);
    }

    // Heuristic: if X-axis looks like a date, suggest LineChart, else BarChart
    let isDate = false;
    if (data[0] && typeof data[0][xAxisKey] === 'string' && !isNaN(Date.parse(data[0][xAxisKey]))) {
       isDate = true;
    }

    return { xAxisKey, yAxisKeys, type: isDate ? 'line' : 'bar' };
  }, [data, fields]);

  if (!chartConfig) {
    return <div className="text-gray-500 italic p-4 text-center">Cannot automatically chart this data format.</div>;
  }

  const { xAxisKey, yAxisKeys, type } = chartConfig;

  // Colors for multiple series
  const colors = ['#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {yAxisKeys.map((key, idx) => (
              <Bar key={key} dataKey={key} fill={colors[idx % colors.length]} />
            ))}
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {yAxisKeys.map((key, idx) => (
              <Line key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} activeDot={{ r: 8 }} />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
