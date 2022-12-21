import React from 'react';
import PropTypes from 'prop-types';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CommentForm from './CommentForm';

const Comments = ({
  stylingProps, imgLink, comments, handleNewComment,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason && reason === 'backdropClick') return;
    setOpen(false);
  };

  const updateComments = (comment) => {
    handleNewComment(comment);
    setOpen(false);
  };

  return (
    <div style={{ ...stylingProps, overflowY: 'auto', paddingBottom: 3 }}>
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
        <div style={{ display: 'flex', marginLeft: 20 }}>
          <Avatar
            alt="Remy Sharp"
            src={imgLink}
            sx={{ width: 56, height: 56, marginRight: 3 }}
          />
          <Fab
            color="primary"
            aria-label="add"
            onMouseDown={e => e.preventDefault()}
            onClick={handleClickOpen}
          >
            <AddIcon />
          </Fab>
        </div>
      </div>
      {
        comments.map((c, idx) => (
          <React.Fragment key={Math.floor(Math.random() * 10000)}>
            <Card
              sx={{ margin: 1 }}
              raised
            >
              <CardContent>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {`${c.comment} idx - ${idx}`}
                </Typography>
              </CardContent>
            </Card>
          </React.Fragment>

        ))
      }
      <CommentForm
        open={open}
        handleClose={handleClose}
        handleSubmit={updateComments}
      />
    </div>
  );
};

export default Comments;

Comments.propTypes = {
  comments: PropTypes.arrayOf(PropTypes.any).isRequired,
  imgLink: PropTypes.string.isRequired,
  stylingProps: PropTypes.objectOf(PropTypes.number).isRequired,
  handleNewComment: PropTypes.func.isRequired,
};
