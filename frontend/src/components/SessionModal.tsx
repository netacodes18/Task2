import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, TextField, IconButton, Tooltip
} from '@mui/material';
import { Copy, KeyRound, RefreshCcw } from 'lucide-react';
import { getSessionId, setSessionId } from '../utils/session';

interface SessionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SessionModal({ open, onClose }: SessionModalProps) {
  const [currentId, setCurrentId] = useState('');
  const [restoreId, setRestoreId] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCurrentId(getSessionId());
      setRestoreId('');
      setError(null);
      setCopied(false);
    }
  }, [open]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestore = () => {
    if (!restoreId.trim()) {
      setError('Please enter a valid Session Key.');
      return;
    }
    
    // Set the new session ID
    setSessionId(restoreId);
    
    // Force a hard reload so Axios and React re-initialize with the new session
    window.location.reload();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold flex items-center gap-2 text-gray-800">
        <KeyRound size={20} className="text-primary" /> Session Identity Manager
      </DialogTitle>
      
      <DialogContent dividers className="flex flex-col gap-6">
        <Typography variant="body2" className="text-gray-600">
          Your datasets are securely isolated using a unique <strong>Session Key</strong>. 
          If you clear your browser cache or switch to a new device, you will lose access to your data unless you restore your key!
        </Typography>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-2">
            Your Current Session Key
          </Typography>
          <div className="flex gap-2 items-center">
            <TextField 
              value={currentId} 
              variant="outlined" 
              size="small" 
              fullWidth 
              slotProps={{ htmlInput: { readOnly: true, className: "font-mono text-sm bg-white" } }}
            />
            <Tooltip title={copied ? "Copied!" : "Copy Key"}>
              <IconButton onClick={handleCopy} color={copied ? "success" : "primary"} className="bg-white border border-gray-200 hover:bg-gray-100">
                <Copy size={18} />
              </IconButton>
            </Tooltip>
          </div>
          <Typography variant="caption" className="text-gray-500 mt-2 block">
            Save this key somewhere safe (like a password manager) to access your data later.
          </Typography>
        </div>

        <div className="pt-2">
          <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-2">
            Restore Existing Session
          </Typography>
          <Typography variant="body2" className="text-gray-500 mb-3">
            Paste a previously saved Session Key to access your old datasets on this browser.
          </Typography>
          <div className="flex gap-2 items-start">
            <TextField 
              placeholder="Paste Session Key here..."
              value={restoreId}
              onChange={(e) => { setRestoreId(e.target.value); setError(null); }}
              variant="outlined" 
              size="small" 
              fullWidth 
              className="font-mono text-sm"
              error={!!error}
              helperText={error}
            />
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleRestore}
              className="whitespace-nowrap px-4 py-2"
              startIcon={<RefreshCcw size={16} />}
            >
              Restore
            </Button>
          </div>
        </div>
      </DialogContent>
      
      <DialogActions className="p-4">
        <Button onClick={onClose} variant="outlined" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
