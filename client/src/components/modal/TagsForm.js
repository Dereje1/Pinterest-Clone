import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DoneIcon from '@mui/icons-material/Done';
import TextField from '@mui/material/TextField';

function TagsForm({ closeTagsForm, addTag }) {
  const [tag, setTag] = useState('');

  const handleTag = ({ target: { value } }) => {
    if (value.trim().length < 16) {
      setTag(value);
    }
  };

  const handleEnterKey = ({ key }) => {
    if (key === 'Enter' && tag.trim().length) {
      addTag(tag.trim());
    }
  };

  return (
    <div style={{
      width: 150,
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
        variant="standard"
        fullWidth
        value={tag}
        onChange={handleTag}
        onBlur={closeTagsForm}
        onKeyDown={handleEnterKey}
      />

      <DoneIcon
        color="success"
        onClick={() => tag.trim().length && addTag(tag.trim())}
        onMouseDown={(e) => e.preventDefault()}
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
}

export default TagsForm;

TagsForm.propTypes = {
  closeTagsForm: PropTypes.func.isRequired,
  addTag: PropTypes.func.isRequired,
};
