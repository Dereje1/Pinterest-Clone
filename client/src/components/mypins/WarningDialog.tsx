import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

interface WarningDialogProps {
    showDialog: boolean,
    title: string,
    handleCancel: () => void,
    handleContinue: () => void
}

function WarningDialog({
  showDialog, title, handleCancel, handleContinue,
}: WarningDialogProps) {
  return (
    <Dialog
      open={showDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {title}
      </DialogTitle>
      <DialogActions>
        <Button
          id="cancel-alert"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          id="resume-alert"
          onClick={handleContinue}
          autoFocus
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WarningDialog;
