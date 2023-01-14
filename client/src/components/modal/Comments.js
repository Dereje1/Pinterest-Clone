import React from 'react';
import PropTypes from 'prop-types';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Card from '@mui/material/Card';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';
import CommentForm from './CommentForm';
import PinnersDialog from './PinnersDialog';
import Tags from './Tags';
import { formatDate } from '../../utils/utils';

function Comments({
  stylingProps,
  pinInformation,
  handleNewComment,
  authenticated,
  toggleComments,
  closePin,
  updateTags,
}) {
  const [openCommentForm, setOpenCommentForm] = React.useState(false);
  const [openPinnersDialog, setOpenPinnersDialog] = React.useState(false);

  const handleOpenCommentForm = () => {
    setOpenCommentForm(true);
  };

  const handleCloseCommentForm = () => {
    setOpenCommentForm(false);
  };

  const submitComment = (comment) => {
    if (comment.trim().length) {
      handleNewComment(comment);
    }
    setOpenCommentForm(false);
  };

  return (
    <div style={{ ...stylingProps, overflowY: 'auto', paddingBottom: 17 }}>
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        width: 300,
        display: 'flex',
        justifyContent: 'space-evenly',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
      >
        <Fab
          color="error"
          aria-label="close"
          onClick={closePin}
        >
          <CloseIcon fontSize="large" />
        </Fab>

        {pinInformation.savedBy.length
          ? (
            <Fab
              color="success"
              aria-label="pinners"
              onClick={() => setOpenPinnersDialog(true)}
            >
              <StarBorderIcon fontSize="large" />
            </Fab>
          )
          : null}
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleOpenCommentForm}
          disabled={!authenticated || openCommentForm}
        >
          <AddIcon fontSize="large" />
        </Fab>
      </div>

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
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
            paddingLeft: 10,
            paddingRight: 10,
          }}
        >
          <div
            id="thumbnail"
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

          <Tags
            commentFormIsOpen={openCommentForm}
            updateTags={updateTags}
            pinInformation={pinInformation}
          />
        </div>
      </div>
      {
        openCommentForm && (
          <CommentForm
            handleClose={handleCloseCommentForm}
            handleSubmit={submitComment}
          />
        )
      }
      {
        !openCommentForm && !pinInformation.comments.length && (
          <Card
            sx={{ margin: 1 }}
            raised
          >
            <CardContent>
              <Typography variant="h6" color="text.secondary" sx={{ margin: 'auto' }}>
                {authenticated
                  ? `Be the first to write a comment on ${pinInformation.imgDescription}...`
                  : `Login and be the first to write a comment on ${pinInformation.imgDescription}...`}
              </Typography>
            </CardContent>
          </Card>
        )
      }
      {
        !openCommentForm && pinInformation.comments.map(({
          _id, comment, displayName, createdAt,
        }) => (
          <React.Fragment key={_id}>
            <Card
              sx={{ margin: 1 }}
              raised
            >
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ color: '#4c62bc', fontWeight: 'bold' }}>
                    {`${displayName}`}
                  </Typography>
                  <Typography color="text.secondary" sx={{ ml: 1, fontSize: 12 }}>
                    {`- ${formatDate(createdAt)}`}
                  </Typography>
                </div>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {comment}
                </Typography>
              </CardContent>
            </Card>
          </React.Fragment>
        ))
      }
      <PinnersDialog
        open={openPinnersDialog}
        onCloseDialog={() => setOpenPinnersDialog(false)}
        pinnersList={pinInformation.savedBy}
        onClosePin={closePin}
      />
    </div>
  );
}

export default Comments;

Comments.propTypes = {
  pinInformation: PropTypes.objectOf(PropTypes.shape).isRequired,
  stylingProps: PropTypes.objectOf(PropTypes.number).isRequired,
  handleNewComment: PropTypes.func.isRequired,
  authenticated: PropTypes.bool.isRequired,
  toggleComments: PropTypes.func.isRequired,
  closePin: PropTypes.func.isRequired,
  updateTags: PropTypes.func.isRequired,
};
