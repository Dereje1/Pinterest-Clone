import React from 'react';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Card from '@mui/material/Card';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';
import Avatar from '@mui/material/Avatar';
import CommentForm from './CommentForm';
import PinnersDialog from './PinnersDialog';
import ProfileLink from './ProfileLink';
import Tags from './Tags';
import { formatDate } from '../../utils/utils';
import { PinType } from '../../interfaces';

interface CommentsProps {
  stylingProps: {width: number, height: number}
  pinInformation: PinType
  authenticated: boolean
  handleNewComment: (comment: string) => void
  toggleComments: () => void
  closePin: (_: React.SyntheticEvent, forceClose?: boolean) => void
  updateTags: (query: string) => void
  displayLogin: () => void
}

function Comments({
  stylingProps,
  pinInformation,
  authenticated,
  handleNewComment,
  toggleComments,
  closePin,
  updateTags,
  displayLogin,
}: CommentsProps) {
  const [openCommentForm, setOpenCommentForm] = React.useState(false);
  const [openPinnersDialog, setOpenPinnersDialog] = React.useState(false);

  const handleOpenCommentForm = () => {
    setOpenCommentForm(true);
  };

  const handleCloseCommentForm = () => {
    setOpenCommentForm(false);
  };

  const submitComment = (comment: string) => {
    if (comment.trim().length) {
      handleNewComment(comment);
    }
    setOpenCommentForm(false);
  };

  return (
    <div style={{ ...stylingProps, overflowY: 'auto', paddingBottom: 3 }}>
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        width: 300,
        display: 'flex',
        justifyContent: 'space-around',
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

        <Fab
          color="success"
          aria-label="pinners"
          onClick={() => setOpenPinnersDialog(true)}
          disabled={!pinInformation.savedBy.length}
        >
          <StarBorderIcon fontSize="large" />
        </Fab>

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

          <Avatar
            id="thumbnail"
            alt={pinInformation.imgDescription}
            src={pinInformation.imgLink}
            style={{ width: 56, height: 56, cursor: 'pointer' }}
            onClick={toggleComments}
          />

          <Tags
            commentFormIsOpen={openCommentForm}
            updateTags={updateTags}
            pinInformation={pinInformation}
            closePin={closePin}
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
          _id, comment, displayName, createdAt, userId,
        }, idx) => (
          <React.Fragment key={_id}>
            <Card
              sx={{ margin: 1 }}
              raised
            >
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ProfileLink
                    authenticated={authenticated}
                    closePin={closePin}
                    displayLogin={displayLogin}
                    title={(
                      <Typography variant="subtitle1" sx={{ color: '#3752ff', fontWeight: 'bold' }}>
                        {`${displayName}`}
                      </Typography>
                    )}
                    userId={userId}
                  />
                  <Typography color="text.secondary" sx={{ ml: 1, fontSize: 12 }}>
                    {`- ${formatDate(createdAt)}`}
                  </Typography>
                </div>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {comment}
                </Typography>
              </CardContent>
            </Card>
            {idx === pinInformation.comments.length - 1 && <div style={{ width: '100%', height: 65 }} />}
          </React.Fragment>
        ))
      }
      <PinnersDialog
        authenticated={authenticated}
        displayLogin={displayLogin}
        open={openPinnersDialog}
        onCloseDialog={() => setOpenPinnersDialog(false)}
        pinnersList={pinInformation.savedBy}
        onClosePin={closePin}
      />
    </div>
  );
}

export default Comments;
