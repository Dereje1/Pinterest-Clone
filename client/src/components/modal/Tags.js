import * as React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import TagIcon from '@mui/icons-material/Tag';
import updateSearch from '../../actions/search';
import TagsForm from './TagsForm';

export const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

function TagsArray({
  pinInformation,
  commentFormIsOpen,
  updateTags,
  closePin,
}) {
  const { tags, owns, _id } = pinInformation;
  const [tagData, setTagData] = React.useState([]);
  const [openTagsForm, setOpenTagsForm] = React.useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

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

  const handleTagClick = (tag) => {
    closePin();
    dispatch(updateSearch(tag, true));
    history.push('/');
  };

  if (!commentFormIsOpen && openTagsForm) {
    return (
      <TagsForm
        closeTagsForm={() => setOpenTagsForm(false)}
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
        elevation={0}
      >
        {tagData.map((data) => (
          <ListItem key={data._id}>
            <Chip
              color="warning"
              label={data.tag.toUpperCase()}
              onDelete={owns ? handleDelete(data) : undefined}
              variant="outlined"
              size="small"
              onClick={() => handleTagClick(data.tag)}
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
  commentFormIsOpen: PropTypes.bool.isRequired,
  updateTags: PropTypes.func.isRequired,
  closePin: PropTypes.func.isRequired,
  pinInformation: PropTypes.objectOf(PropTypes.shape).isRequired,
};
