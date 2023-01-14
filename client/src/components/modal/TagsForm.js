import React, { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import TextField from '@mui/material/TextField';

function TagsForm({ closeTagsForm, addTag, stylingProps }) {
  const [tag, setTag] = useState('');
  return (
    <div style={{
      width: stylingProps.width / 1.5,
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'flex',
      alignItems: 'flex-end',
    }}
    >
      <TextField
        autoFocus
        id="Tags_form"
        label="Add a Tag"
        type="text"
        variant="filled"
        fullWidth
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        onBlur={closeTagsForm}
      />
      {/* <IconButton onClick={closeTagsForm}>
        <ClearIcon color="error" />
      </IconButton> */}
      <IconButton onClick={() => addTag(tag)} onMouseDown={(e) => e.preventDefault()}>
        <DoneIcon color="success" />
      </IconButton>
    </div>
  );
}

export default TagsForm;

TagsForm.propTypes = {
  closeTagsForm: PropTypes.func.isRequired,
  addTag: PropTypes.func.isRequired,
  stylingProps: PropTypes.objectOf(PropTypes.shape).isRequired,
};
