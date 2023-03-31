import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import TagIcon from '@mui/icons-material/Tag';
import updateSearch from '../../../actions/search';
import TagsForm from './TagsForm';
import RESTcall from '../../../crud';
import { PinType, tagType } from '../../../interfaces';

export const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

interface TagsArrayProps {
  pinInformation: PinType
  commentFormIsOpen: boolean
  updateTags: (tag: string) => void
  closePin: (_: React.SyntheticEvent, forceClose?: boolean) => void
}

const initialTags: tagType[] | null = [];

function TagsArray({
  pinInformation,
  commentFormIsOpen,
  updateTags,
  closePin,
}: TagsArrayProps) {
  const { tags, owns, _id } = pinInformation;
  const [tagData, setTagData] = React.useState(initialTags);
  const [openTagsForm, setOpenTagsForm] = React.useState(false);
  const [suggestedTags, setSuggestedTags] = React.useState([]);

  const dispatch = useDispatch();
  const history = useHistory();

  const fetchSuggestedTags = async () => {
    try {
      const retreivedTags = await RESTcall({ address: '/api/getTags' });
      setSuggestedTags(retreivedTags);
    } catch (error) {
      setSuggestedTags([]);
    }
  };

  React.useEffect(() => {
    setTagData(tags);
  }, [tags]);

  React.useEffect(() => {
    if (openTagsForm) {
      fetchSuggestedTags();
    }
  }, [openTagsForm]);

  const handleAdd = (val: string) => {
    updateTags(`?pinID=${_id}&tag=${val}`);
    setOpenTagsForm(false);
  };

  const handleDelete = (tagToDelete: tagType) => () => {
    updateTags(`?pinID=${_id}&deleteId=${tagToDelete._id}`);
  };

  const handleTagClick = (e: React.SyntheticEvent, tag: string) => {
    closePin(e);
    dispatch(updateSearch(tag, true));
    history.push('/');
  };

  if (tagData && !commentFormIsOpen && openTagsForm) {
    return (
      <TagsForm
        closeTagsForm={() => setOpenTagsForm(false)}
        addTag={handleAdd}
        suggestedTags={suggestedTags}
        exisitingTags={tagData.map((t) => t.tag.toUpperCase())}
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
        {tagData && tagData.map((data) => (
          <ListItem key={data._id}>
            <Chip
              color="warning"
              label={data.tag.toUpperCase()}
              onDelete={owns ? handleDelete(data) : undefined}
              variant="outlined"
              size="small"
              onClick={(e) => handleTagClick(e, data.tag)}
            />
          </ListItem>
        ))}

      </Paper>
      <div style={{ marginRight: 3 }}>
        { owns && tagData && tagData.length < 6 && (
          <IconButton onClick={() => setOpenTagsForm(true)} disabled={commentFormIsOpen}>
            <TagIcon />
          </IconButton>
        )}
      </div>
    </div>

  );
}

export default TagsArray;
