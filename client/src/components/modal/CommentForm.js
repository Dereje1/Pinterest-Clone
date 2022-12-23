import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

const CommentForm = ({ open, handleClose, handleSubmit }) => {
  const [comment, setComment] = useState('');

  useEffect(() => {
    setComment('');
  }, [open]);

  return (
    <div>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="comment_form"
            label="Add a comment"
            type="text"
            multiline
            rows={3}
            fullWidth
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={() => handleSubmit(comment)}>Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CommentForm;

CommentForm.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};
