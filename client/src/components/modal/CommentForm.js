import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

function CommentForm({ handleClose, handleSubmit }) {
  const [comment, setComment] = useState('');

  return (
    <div style={{
      margin: 5, display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
    }}
    >
      <TextField
        autoFocus
        id="comment_form"
        label="Add a comment"
        type="text"
        multiline
        rows={3}
        fullWidth
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        sx={{ caretColor: 'black' }}
      />
      <div style={{ marginTop: 1 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={() => handleSubmit(comment)}>Submit</Button>
      </div>
    </div>
  );
}

export default CommentForm;

CommentForm.propTypes = {
  handleClose: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};
