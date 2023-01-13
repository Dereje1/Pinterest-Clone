import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import TagsForm from './TagsForm';

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

function TagsArray({ owns, stylingProps, commentFormIsOpen }) {
  const [tagData, setTagData] = React.useState([
    { key: 0, label: 'Angular' },
    { key: 1, label: 'jQuery' },
    { key: 2, label: 'Polymer' },
    { key: 3, label: 'React' },
    { key: 4, label: 'Vue.js' },
  ]);
  const [openTagsForm, setOpenTagsForm] = React.useState(false);

  const handleAdd = (val) => {
    setTagData([...tagData, { key: tagData.length, label: val }]);
    setOpenTagsForm(false);
  };

  const handleDelete = (chipToDelete) => () => {
    setTagData((chips) => chips.filter((chip) => chip.key !== chipToDelete.key));
  };

  if (!commentFormIsOpen && openTagsForm) {
    return (
      <TagsForm
        closeTagsForm={() => setOpenTagsForm(false)}
        stylingProps={stylingProps}
        addTag={handleAdd}
      />
    );
  }

  return (
    <Paper
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        listStyle: 'none',
        p: 0.5,
        m: 1,
      }}
      component="ul"
    >
      {tagData.map((data) => (
        <ListItem key={data.key}>
          <Chip
            color="primary"
            label={data.label}
            onDelete={owns ? handleDelete(data) : undefined}
          />
        </ListItem>
      ))}
      { owns && tagData.length < 6 && (
        <IconButton onClick={() => setOpenTagsForm(true)} disabled={commentFormIsOpen}>
          <AddIcon />
        </IconButton>
      )}
    </Paper>
  );
}

export default TagsArray;

TagsArray.propTypes = {
  owns: PropTypes.bool.isRequired,
  stylingProps: PropTypes.objectOf(PropTypes.shape).isRequired,
  commentFormIsOpen: PropTypes.bool.isRequired,
};
