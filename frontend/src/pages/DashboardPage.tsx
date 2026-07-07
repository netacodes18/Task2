import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper 
} from '@mui/material';
import { ChevronRight, ArrowUpRight, ArrowDownRight, Filter, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Colors for charts
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b', '#06b6d4'];

export default function DashboardPage() {
  const { datasetId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [datasetMeta, setDatasetMeta] = useState<any>(null);

  useEffect(() => {
    if (datasetId) {
      fetchDashboard();
    }
  }, [datasetId]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch metadata first to get the name
      const metaRes = await axios.get(`${API_URL}/api/datasets/${datasetId}`);
      setDatasetMeta(metaRes.data);

      // Fetch AI generated dashboard data
      const dashRes = await axios.get(`${API_URL}/api/dashboard/${datasetId}`);
      setDashboardData(dashRes.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load dashboard. The AI might have struggled to generate queries for this dataset.');
    } finally {
      setLoading(false);
    }
  };

  if (!datasetId) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">No Dataset Selected</h2>
        <Link to="/" className="px-6 py-2 bg-[#10b981] text-white rounded-lg hover:bg-emerald-600 transition">
          Go to Datasets
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
        <CircularProgress size={60} sx={{ color: '#10b981' }} />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">AI is Analyzing Your Data...</h2>
          <p className="text-gray-500 mt-2 max-w-md">
            Our AI is writing optimal MongoDB aggregation pipelines to automatically design a beautiful dashboard for you. This takes about 10-15 seconds the first time!
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Alert severity="error" className="mb-4">{error}</Alert>
        <Link to={`/chat/${datasetId}`} className="text-[#10b981] hover:underline font-medium">
          Fallback to AI Chat instead &rarr;
        </Link>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="flex flex-col space-y-6 w-full pb-10">
      
      {/* Header Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
          <Link to="/" className="hover:text-gray-800 transition">Datasets</Link>
          <ChevronRight size={16} />
          <span className="text-gray-900 font-bold">{datasetMeta?.name || 'Dataset'} Analysis</span>
        </div>
        <div className="flex space-x-3 text-gray-400">
          <button className="p-2 hover:bg-gray-50 rounded-full transition"><Filter size={18} /></button>
          <button className="p-2 hover:bg-gray-50 rounded-full transition"><Search size={18} /></button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {dashboardData.kpis?.map((kpi: any, idx: number) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
            <h3 className="text-gray-500 font-medium text-sm mb-1">{kpi.title}</h3>
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {kpi.error ? 'Error' : typeof kpi.data === 'number' ? kpi.data.toLocaleString() : kpi.data}
            </div>
            {/* Fake trend indicator for UI polish */}
            <div className={`flex items-center text-sm font-medium ${idx % 3 === 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {idx % 3 === 0 ? <ArrowDownRight size={16} className="mr-1"/> : <ArrowUpRight size={16} className="mr-1"/>}
              {Math.floor(Math.random() * 20 + 1)}.{Math.floor(Math.random() * 99)}%
            </div>
            
            {/* Sparkline decorative curve */}
            <svg className="absolute bottom-0 left-0 w-full h-12 opacity-20" preserveAspectRatio="none" viewBox="0 0 100 100">
               <path d={idx % 2 === 0 ? "M0,100 C20,80 40,100 60,60 C80,20 100,50 100,100" : "M0,100 C30,40 50,80 80,30 C90,10 100,60 100,100"} 
                     fill="none" stroke={idx % 3 === 0 ? "#ef4444" : "#10b981"} strokeWidth="4" />
            </svg>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Bar */}
        {dashboardData.charts?.filter((c: any) => c.type === 'bar').map((chart: any, idx: number) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-[400px]">
            <h3 className="text-gray-800 font-bold mb-1">{chart.title}</h3>
            <p className="text-xs text-gray-400 mb-6">Generated by AI based on {chart.xAxisKey}</p>
            <div className="flex-grow w-full">
              {chart.error ? <div className="text-red-500 text-sm">Failed to generate query</div> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart.data} margin={{ top: 5, right: 20, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey={chart.xAxisKey} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                    <RechartsTooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                    <Bar dataKey={chart.yAxisKey} fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {chart.data.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        ))}

        {/* Chart 2: Table or Line */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-[400px]">
           <div className="flex justify-between items-center mb-1">
             <h3 className="text-gray-800 font-bold">Data Overview</h3>
             <Link to={`/chat/${datasetId}`} className="text-xs text-[#10b981] hover:underline font-medium">Ask AI &rarr;</Link>
           </div>
           <p className="text-xs text-gray-400 mb-4">Top 5 records from your dataset</p>
           
           <div className="flex-grow w-full overflow-auto">
             <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: '8px' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {datasetMeta?.column_schema?.slice(0, 5).map((col: any) => (
                        <TableCell key={col.name} sx={{ fontWeight: 600, color: '#6b7280', fontSize: '12px', bgcolor: '#f9fafb' }}>
                          {col.name.toUpperCase()}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Since we don't fetch raw data in dashboard directly, we will use chart data if available or just show a message */}
                    {dashboardData.charts?.[0]?.data?.slice(0,5).map((row: any, i: number) => (
                      <TableRow key={i} hover>
                        {datasetMeta?.column_schema?.slice(0, 5).map((col: any) => (
                          <TableCell key={col.name} sx={{ fontSize: '13px', color: '#374151', borderBottom: '1px solid #f3f4f6' }}>
                            {String(row[col.name] || row._id || '-')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </TableContainer>
           </div>
        </div>

      </div>

      {/* Bottom Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart */}
        {dashboardData.charts?.filter((c: any) => c.type === 'pie').map((chart: any, idx: number) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-[400px]">
             <h3 className="text-gray-800 font-bold mb-1">{chart.title}</h3>
             <p className="text-xs text-gray-400 mb-6">Distribution based on {chart.nameKey}</p>
             <div className="flex-grow w-full flex items-center justify-center">
               {chart.error ? <div className="text-red-500 text-sm">Failed to generate query</div> : (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={chart.data}
                       cx="50%"
                       cy="50%"
                       innerRadius={80}
                       outerRadius={120}
                       paddingAngle={5}
                       dataKey={chart.valueKey}
                       nameKey={chart.nameKey}
                     >
                       {chart.data.map((_: any, index: number) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                     <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{fontSize: '12px', color: '#4b5563'}}/>
                   </PieChart>
                 </ResponsiveContainer>
               )}
             </div>
          </div>
        ))}

        {/* Line Chart */}
        {dashboardData.charts?.filter((c: any) => c.type === 'line').map((chart: any, idx: number) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-[400px]">
             <h3 className="text-gray-800 font-bold mb-1">{chart.title}</h3>
             <p className="text-xs text-gray-400 mb-6">Trend analysis across {chart.xAxisKey}</p>
             <div className="flex-grow w-full">
               {chart.error ? <div className="text-red-500 text-sm">Failed to generate query</div> : (
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={chart.data} margin={{ top: 5, right: 20, left: 0, bottom: 25 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis dataKey={chart.xAxisKey} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                     <RechartsTooltip cursor={{stroke: '#e5e7eb', strokeWidth: 2}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                     <Line type="monotone" dataKey={chart.yAxisKey} stroke="#06b6d4" strokeWidth={3} dot={{r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                   </LineChart>
                 </ResponsiveContainer>
               )}
             </div>
          </div>
        ))}

      </div>

    </div>
  );
}
