import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DoneIcon from '@mui/icons-material/Done';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

function TagsForm({
  closeTagsForm,
  addTag,
  suggestedTags,
  exisitingTags,
}) {
  const [tag, setTag] = useState('');

  // args for mui onInputChange callback => event, value, reason
  const handleTag = (_, value) => {
    if (value.trim().length < 16) {
      setTag(value);
    }
  };

  const handleTagSubmit = () => {
    const updatedTag = tag.trim().toUpperCase();
    if (updatedTag.length && !exisitingTags.includes(updatedTag)) {
      addTag(updatedTag);
    } else {
      setTag('');
    }
  };

  const handleEnterKey = (e) => {
    if (e.key === 'Enter') {
      handleTagSubmit();
    }
  };

  return (
    <div style={{
      width: 200,
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'flex',
      alignItems: 'flex-end',
    }}
    >
      <Autocomplete
        id="free-solo-tags"
        freeSolo
        options={suggestedTags.map((option) => option.toUpperCase())}
        fullWidth
        disableClearable
        inputValue={tag}
        autoComplete
        onInputChange={handleTag}
        onBlur={closeTagsForm}
        onKeyDown={handleEnterKey}
        filterOptions={(options) => {
          const filtered = [];
          options.forEach((o) => {
            if (!exisitingTags.includes(o) && o.startsWith(tag.toUpperCase())) {
              filtered.push(o);
            }
          });
          return filtered;
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            autoFocus
            id="Tags_form"
            label="Add a Tag"
            type="text"
            variant="standard"
          />
        )}
      />

      <DoneIcon
        color="success"
        onClick={() => handleTagSubmit(tag)}
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
  suggestedTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  exisitingTags: PropTypes.arrayOf(PropTypes.string).isRequired,
};
