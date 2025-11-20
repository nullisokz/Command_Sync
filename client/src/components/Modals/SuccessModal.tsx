import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  
} from '@mui/material';
import type {SxProps,
  Theme} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// 1. Define the interface for the component's props
interface SuccessModalProps {
  
  open: boolean; 
  /** Function to close the dialog. */
  onClose: () => void;
  /** The name of the user who was created (optional). */
  userName?: string; 
}

// Style for the centered success icon using MUI's SxProps type
const iconStyle: SxProps<Theme> = {
  fontSize: '4rem', 
  color: 'success.main', 
  marginBottom: 2,
};

/**
 * Reusable success dialog for showing confirmation feedback.
 */
const SuccessModal: React.FC<SuccessModalProps> = ({ open, onClose, userName }) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="success-dialog-title">
      
      <DialogContent sx={{ textAlign: 'center', p: 4 }}>
        <CheckCircleIcon sx={iconStyle} />
        
        {/* The component prop ensures the correct HTML element is rendered */}
        <DialogTitle id="success-dialog-title" variant="h5" component="div" sx={{ p: 0, mb: 1 }}>
          Success!
        </DialogTitle>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {/* Use optional chaining for userName for safety, although the interface handles it */}
          {userName 
            ? `The user "${userName}" has been successfully created.` 
            : "The new user has been successfully created."
          }
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        {/* The onClick handler is correctly typed as () => void */}
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="success" 
          autoFocus 
        >
          Close
        </Button>
      </DialogActions>
      
    </Dialog>
  );
};

export default SuccessModal;