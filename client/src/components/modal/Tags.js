import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import TagIcon from '@mui/icons-material/Tag';
import TagsForm from './TagsForm';

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

function TagsArray({
  pinInformation,
  stylingProps,
  commentFormIsOpen,
  updateTags,
}) {
  const { tags, owns, _id } = pinInformation;
  const [tagData, setTagData] = React.useState([]);
  const [openTagsForm, setOpenTagsForm] = React.useState(false);

  React.useEffect(() => {
    setTagData(tags);
  }, [tags]);

  const handleAdd = (val) => {
    updateTags(`?pinID=${_id}&tag=${val}`);
    setOpenTagsForm(false);
  };

  const handleDelete = (tagToDelete) => () => {
    updateTags(`?pinID=${_id}&deleteId=${tagToDelete._id}`);
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        elevation={3}
      >
        {tagData.map((data) => (
          <ListItem key={data._id}>
            <Chip
              color="info"
              label={data.tag.toUpperCase()}
              onDelete={owns ? handleDelete(data) : undefined}
              variant="outlined"
              size="small"
            />
          </ListItem>
        ))}

      </Paper>
      <div style={{ mr: 3 }}>
        { owns && tagData.length < 6 && (
          <IconButton onClick={() => setOpenTagsForm(true)} disabled={commentFormIsOpen}>
            <TagIcon />
          </IconButton>
        )}
      </div>
    </div>

  );
}

export default TagsArray;

TagsArray.propTypes = {
  stylingProps: PropTypes.objectOf(PropTypes.shape).isRequired,
  commentFormIsOpen: PropTypes.bool.isRequired,
  updateTags: PropTypes.func.isRequired,
  pinInformation: PropTypes.objectOf(PropTypes.shape).isRequired,
};
