import React, { useState } from 'react';
import DoneIcon from '@mui/icons-material/Done';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

interface TagsFormProps {
  closeTagsForm: () => void
  addTag: (tag: string) => void
  suggestedTags: string[]
  exisitingTags: string[]
}

function TagsForm({
  closeTagsForm,
  addTag,
  suggestedTags,
  exisitingTags,
}: TagsFormProps) {
  const [tag, setTag] = useState('');

  // args for mui onInputChange callback => event, value, reason
  const handleTag = (_: React.SyntheticEvent, value: string) => {
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

  const handleEnterKey = (e: React.KeyboardEvent) => {
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
        filterOptions={(options) => options.filter(
          (option) => !exisitingTags.includes(option) && option.startsWith(tag.toUpperCase()),
        )}
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
        onClick={() => handleTagSubmit()}
        onMouseDown={(e) => e.preventDefault()}
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
}

export default TagsForm;
