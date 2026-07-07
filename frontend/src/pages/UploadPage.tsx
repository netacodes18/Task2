import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, CardContent, Typography, Button, TextField, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Alert, List, ListItem, ListItemText, ListItemButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Upload as UploadIcon, Database, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [successDatasetId, setSuccessDatasetId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/datasets`);
      setDatasets(res.data);
    } catch (err) {
      console.error('Failed to fetch datasets', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setDatasetName(e.target.files[0].name.split('.')[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData);
      setPreview(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/api/upload/confirm`, {
        originalName: preview.originalName,
        schema: preview.schema,
        filePath: preview.filePath,
        datasetName
      });
      
      await fetchDatasets();
      setPreview(null);
      setFile(null);
      setDatasetName('');
      // Show success modal for the new dataset
      if (res.data.dataset) {
         setSuccessDatasetId(res.data.dataset.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create dataset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full flex-grow">
      <div className="md:col-span-1 flex flex-col gap-6 h-full">
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <Typography variant="h6" className="flex items-center gap-2 font-semibold text-gray-800 mb-4">
              <UploadIcon size={20} className="text-primary" /> Upload Dataset
            </Typography>
            
            <div className="flex flex-col gap-4 mt-2">
              <Button 
                variant={file ? "outlined" : "contained"} 
                component="label" 
                fullWidth 
                className="py-3 font-semibold"
                color={file ? "primary" : "primary"}
              >
                {file ? file.name : 'Select CSV/XLSX File'}
                <input type="file" hidden accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
              </Button>
              
              {file && !preview && (
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={handleUpload}
                  disabled={loading}
                  className="py-3 font-semibold mt-2"
                  endIcon={!loading && <ArrowRight size={18} />}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze Dataset'}
                </Button>
              )}
            </div>
            
            {error && (
              <Alert severity="error" className="mt-4">{error}</Alert>
            )}
          </CardContent>
        </Card>

        <Card className="flex-grow flex flex-col shadow-sm border border-gray-200 overflow-hidden min-h-[300px]">
          <CardContent className="p-0 flex flex-col h-full">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <Typography variant="h6" className="flex items-center gap-2 font-semibold text-gray-800">
                <Database size={20} className="text-primary" /> Your Datasets
              </Typography>
            </div>
            <List className="overflow-auto flex-grow">
              {datasets.length === 0 ? (
                <div className="p-4 text-center">
                  <Typography color="textSecondary" variant="body2">No datasets uploaded yet.</Typography>
                </div>
              ) : (
                datasets.map(ds => (
                  <React.Fragment key={ds.id}>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => navigate(`/app/chat/${ds.id}`)} className="py-3 px-4 hover:bg-[#ebf5f0]">
                        <ListItemText 
                          primary={<Typography variant="subtitle2" className="font-semibold text-gray-800">{ds.name}</Typography>} 
                          secondary={`${ds.row_count} rows • ${new Date(ds.created_at).toLocaleDateString()}`} 
                        />
                      </ListItemButton>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2 h-full">
        {preview ? (
          <Card className="h-full flex flex-col shadow-sm border border-gray-200">
            <CardContent className="flex-grow flex flex-col p-6">
              <Typography variant="h5" className="font-bold text-gray-800 mb-2">Schema Preview</Typography>
              <Typography variant="body2" className="text-gray-500 mb-6">Review the detected columns and confirm dataset name before importing.</Typography>
              
              <TextField 
                label="Dataset Name" 
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                fullWidth
                variant="outlined"
                className="mb-6"
              />

              <div className="flex justify-between items-end mb-2">
                <Typography variant="subtitle1" className="font-semibold text-gray-800">Detected Columns</Typography>
                <Typography variant="caption" className="text-gray-500 bg-gray-100 px-2 py-1 rounded">{preview.schema.length} columns total</Typography>
              </div>
              
              <TableContainer component={Paper} className="flex-grow overflow-auto max-h-[400px] border border-gray-200 shadow-none">
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell className="bg-gray-50 font-bold">Column Name</TableCell>
                      <TableCell className="bg-gray-50 font-bold">Inferred Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.schema.map((col: any, idx: number) => (
                      <TableRow key={idx} hover>
                        <TableCell className="font-medium">{col.name}</TableCell>
                        <TableCell>
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{col.type}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100 justify-end">
                <Button variant="outlined" onClick={() => setPreview(null)} disabled={loading} size="large">
                  Cancel
                </Button>
                <Button variant="contained" color="primary" onClick={handleConfirm} disabled={loading} size="large">
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm & Import Data'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center shadow-sm border border-gray-200 bg-gray-50 border-dashed">
            <div className="text-center p-8">
              <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-4">
                <Database size={48} className="text-gray-400" />
              </div>
              <Typography variant="h5" className="text-gray-600 font-semibold mb-2">Ready to analyze</Typography>
              <Typography variant="body1" className="text-gray-500 max-w-sm mx-auto">
                Select a dataset from the list on the left or upload a new one to begin asking questions.
              </Typography>
            </div>
          </Card>
        )}
      </div>
    </div>

    {/* Success Modal */}
    <Dialog open={!!successDatasetId} onClose={() => setSuccessDatasetId(null)} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold text-gray-800">Dataset Imported Successfully!</DialogTitle>
      <DialogContent>
        <Typography variant="body1" className="text-gray-600 mb-4 mt-2">
          Your dataset has been imported and is ready for analysis. What would you like to do next?
        </Typography>
      </DialogContent>
      <DialogActions className="p-4 gap-2 flex-col sm:flex-row">
        <Button 
          variant="outlined" 
          onClick={() => navigate(`/app/chat/${successDatasetId}`)}
          className="flex-1 py-3"
          color="primary"
        >
          Talk to AI about Data
        </Button>

      </DialogActions>
    </Dialog>
    </>
  );
}
