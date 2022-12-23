// displays pin zoom modal
import React, { Component } from 'react';
import PropTypes from 'prop-types';
/* MUI */
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import CommentIcon from '@mui/icons-material/Comment';
import { styled } from '@mui/styles';
/* local components and utility */
import ModalActions from './ModalActions';
import Comments from './Comments';
import {
  delay, getNewImageWidth, getFormattedDescription, formatDate,
} from '../../utils/utils';
import './modal.scss';

const StyledBadge = styled(Badge)(({ name }) => ({
  '& .MuiBadge-badge': {
    right: name === 'pin' ? 32 : 43,
    top: name === 'pin' ? 17 : 13,
    border: '2px solid grey',
    padding: '0 4px',
  },
}));

export class PinZoom extends Component {

  constructor(props) {
    super(props);
    // initialize modal show state to false
    this.state = {
      show: false,
      parentDivStyle: { top: 0, width: '90%' },
      commentsShowing: null,
      cancelBlur: false,
    };
    this.zoomedImage = React.createRef();
  }

  componentDidMount() {
    this.zoomedImage.current.focus();
    const { zoomInfo } = this.props;
    const { parentDivStyle } = this.state;
    const [, browserTop] = zoomInfo;
    // set top and scroll to current position and disable scroll
    window.scrollTo(0, browserTop);
    document.body.style.overflow = 'hidden';
    this.setState({
      show: true,
      parentDivStyle: {
        ...parentDivStyle,
        top: browserTop,
      },
    }, async () => { await delay(1000); });
  }

  componentWillUnmount() {
    document.body.style.overflowY = 'scroll';
  }

  close = (_, forceClose = false) => {
    // sends a reset callback after closing modalstate
    const { cancelBlur } = this.state;
    if (cancelBlur && !forceClose) return;
    const { reset } = this.props;
    this.setState({
      show: false,
    }, async () => {
      // delay to display closing keyframe
      await delay(500);
      reset();
    });
  };

  handleImage = ({ target: { naturalWidth, naturalHeight } }) => {
    const { parentDivStyle } = this.state;
    const newDivStyle = getNewImageWidth({ naturalWidth, naturalHeight });
    // const pcopy = JSON.parse(JSON.stringify(parentDivStyle));
    this.setState({
      parentDivStyle: {
        ...parentDivStyle,
        ...newDivStyle,
      },
    });
  };

  toggleComments = () => {
    const { commentsShowing, parentDivStyle } = this.state;
    if (!commentsShowing) {
      const { current: { clientHeight: cardHeight, children } } = this.zoomedImage;
      const [, image] = children;
      const { clientHeight: imageHeight } = image;
      this.setState({
        commentsShowing: {
          width: parentDivStyle.parentWidth,
          height: imageHeight + (window.innerHeight - cardHeight - 20),
        },
        cancelBlur: true,
      });
      return;
    }
    // need to reinstate focus for blur to work again
    this.zoomedImage.current.focus();
    this.setState({ commentsShowing: null, cancelBlur: false });
  };


  render() {
    const {
      zoomInfo, pinImage, deletePin, user: { authenticated }, handleNewComment,
    } = this.props;
    const {
      show, parentDivStyle, commentsShowing,
    } = this.state;
    if (!zoomInfo.length) return null;
    const [pinInformation] = zoomInfo;
    const totalPins = (pinInformation.savedBy) ? pinInformation.savedBy.length : 0;
    // const pinnedBy = totalPins ? getPinners(pinInformation.savedBy) : '';
    const formattedDescription = getFormattedDescription(pinInformation.imgDescription);
    return (
      <>
        <div className="modal-overlay" />
        <Card
          sx={{
            width: parentDivStyle.parentWidth,
            top: parentDivStyle.top,
          }}
          className={show ? 'zoom cshow' : 'zoom chide'}
          onBlur={this.close}
          ref={this.zoomedImage}
          tabIndex={0}
        >
          <CardHeader
            action={(
              <>
                <StyledBadge badgeContent={pinInformation.comments.length} color="primary" showZero name="comments">
                  <IconButton
                    onClick={this.toggleComments}
                    onMouseDown={e => e.preventDefault()}
                  >
                    {commentsShowing
                      ? <CommentIcon style={{ fontSize: '1.7em' }} />
                      : <CommentOutlinedIcon style={{ fontSize: '1.7em' }} />}
                  </IconButton>
                </StyledBadge>
                <StyledBadge badgeContent={totalPins} color="secondary" showZero name="pin">
                  <ModalActions
                    element={pinInformation}
                    pinImage={pinImage}
                    deletePin={deletePin}
                    reset={this.close}
                  />
                </StyledBadge>
              </>
            )}
            title={formattedDescription}
            subheader={(
              <>
                <span>
                  {pinInformation.owner}
                </span>
                <br />
                <span style={{ fontSize: parentDivStyle.dateSize, marginLeft: 0 }}>
                  {formatDate(pinInformation.createdAt)}
                </span>
              </>
            )}
            titleTypographyProps={{ fontSize: parentDivStyle.titleSize, fontWeight: 'bold' }}
            subheaderTypographyProps={{ fontSize: parentDivStyle.subTitleSize, fontWeight: 'bold' }}
          />
          { !commentsShowing ? (
            <CardMedia
              component="img"
              image={pinInformation.imgLink}
              onLoad={this.handleImage}
              id="pin-zoom"
              sx={{
                width: parentDivStyle.imgWidth,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            />
          )
            : (
              <Comments
                stylingProps={commentsShowing}
                pinInformation={pinInformation}
                handleNewComment={handleNewComment}
                authenticated={authenticated}
                toggleComments={this.toggleComments}
                closePin={e => this.close(e, true)}
              />
            )
          }
        </Card>
      </>
    );
  }

}

export default PinZoom;


PinZoom.defaultProps = {
  pinImage: null,
  deletePin: null,
};

PinZoom.propTypes = {
  // [picobject, overlay button type, last scroll distance]
  zoomInfo: PropTypes.arrayOf(PropTypes.any).isRequired,
  // callback to caller to turn modal off
  reset: PropTypes.func.isRequired,
  // what type of button to place on pic/thumbnail executed by caller
  pinImage: PropTypes.func,
  deletePin: PropTypes.func,
  user: PropTypes.objectOf(PropTypes.any).isRequired,
  handleNewComment: PropTypes.func.isRequired,
};
