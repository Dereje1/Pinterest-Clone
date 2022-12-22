import React from 'react';
import PropTypes from 'prop-types';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CommentForm from './CommentForm';
import PinnersDialog from './PinnersDialog';
import { formatDate } from '../../utils/utils';

const Comments = ({
  stylingProps,
  pinInformation,
  comments,
  handleNewComment,
  authenticated,
  toggleComments,
  closePin,
}) => {
  const [openCommentForm, setOpenCommentForm] = React.useState(false);
  const [openPinnersDialog, setOpenPinnersDialog] = React.useState(false);

  const handleOpenCommentForm = () => {
    setOpenCommentForm(true);
  };

  const handleCloseCommentForm = (event, reason) => {
    if (reason && reason === 'backdropClick') return;
    setOpenCommentForm(false);
  };

  const submitComment = (comment) => {
    if (comment.trim().length) {
      handleNewComment(comment);
    }
    setOpenCommentForm(false);
  };

  return (
    <div style={{ ...stylingProps, overflowY: 'auto', paddingBottom: 3 }}>
      <Fab
        color="primary"
        aria-label="add"
        onMouseDown={e => e.preventDefault()}
        onClick={handleOpenCommentForm}
        sx={{ position: 'absolute', bottom: 10, right: 10 }}
        disabled={!authenticated}
      >
        <AddIcon />
      </Fab>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        background: 'white',
        marginBottom: 10,
      }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            paddingLeft: 10,
            paddingRight: 10,
          }}
        >
          <div
            onClick={toggleComments}
            onKeyDown={() => {}}
            role="button"
            tabIndex="0"
            style={{ cursor: 'pointer' }}
          >
            <img
              alt={pinInformation.imgDescription}
              src={pinInformation.imgLink}
              style={{ objectFit: 'scale-down', width: 56, height: 56 }}
            />
          </div>
          {pinInformation.savedBy.length
            ? <Button variant="text" onClick={() => setOpenPinnersDialog(true)}>Pinners</Button>
            : null
          }
          <IconButton onClick={closePin}>
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      {
        !comments.length && (
          <Card
            sx={{ margin: 1 }}
            raised
          >
            <CardContent>
              <Typography variant="h6" color="text.secondary" sx={{ margin: 'auto' }}>
                {authenticated
                  ? `Be the first to write a comment on ${pinInformation.imgDescription}...`
                  : `Login and be the first to write a comment on ${pinInformation.imgDescription}...`
                }
              </Typography>
            </CardContent>
          </Card>
        )
      }
      {
        comments.map(({
          _id, comment, displayName, createdAt,
        }) => (
          <React.Fragment key={_id}>
            <Card
              sx={{ margin: 1 }}
              raised
            >
              <CardContent>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {comment}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#4c62bc', fontWeight: 'bold' }}>
                  {`${displayName} - ${formatDate(createdAt)}`}
                </Typography>
              </CardContent>
            </Card>
          </React.Fragment>
        ))
      }
      <CommentForm
        open={openCommentForm}
        handleClose={handleCloseCommentForm}
        handleSubmit={submitComment}
      />
      <PinnersDialog
        open={openPinnersDialog}
        onClose={() => setOpenPinnersDialog(false)}
        pinnersList={pinInformation.savedBy}
      />
    </div>
  );
};

export default Comments;

Comments.propTypes = {
  comments: PropTypes.arrayOf(PropTypes.any).isRequired,
  pinInformation: PropTypes.objectOf(PropTypes.any).isRequired,
  stylingProps: PropTypes.objectOf(PropTypes.number).isRequired,
  handleNewComment: PropTypes.func.isRequired,
  authenticated: PropTypes.bool.isRequired,
  toggleComments: PropTypes.func.isRequired,
  closePin: PropTypes.func.isRequired,
};
