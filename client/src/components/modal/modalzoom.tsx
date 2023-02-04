// displays pin zoom modal
import React, { Component, createRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
/* MUI */
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { CardContent } from '@mui/material';
import CardMedia from '@mui/material/CardMedia';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import CommentIcon from '@mui/icons-material/Comment';
import Link from '@mui/material/Link';
import { styled } from '@mui/styles';
/* local components and utility */
import ModalActions from './ModalActions';
import Comments from './Comments';
import {
  delay, getFormattedDescription, formatDate, getUserLinkQuery,
} from '../../utils/utils';
import { PinType, userType } from '../../interfaces';
import './modal.scss';

export const StyledBadge = styled(Badge)(({ name }:{ name: string}) => ({
  '& .MuiBadge-badge': {
    right: name === 'pin' ? 32 : 43,
    top: name === 'pin' ? 17 : 13,
    border: '2px solid grey',
    padding: '0 4px',
  },
}));

interface PinZoomProps {
    zoomInfo: [
      PinType,
      {
        imgWidth: string
        parentWidth: number
        isNoFit: boolean
        top: number
        width: string
      }
    ],
    user: userType
    reset: () => void
    pinImage: (pin: PinType) => void
    deletePin: ((pin: PinType) => void) | null
    handleNewComment: (newComment: string) => void
    updateTags: (query: string) => void
}

interface PinZoomState {
  commentsShowing: {width: number, height: number} | null
  cancelBlur: boolean
  zoomClass: string
}

export class PinZoom extends Component<PinZoomProps, PinZoomState> {

  private zoomedImage = createRef<HTMLDivElement>();

  constructor(props: PinZoomProps) {
    super(props);
    this.state = {
      commentsShowing: null,
      cancelBlur: false,
      zoomClass: 'zoom cshow',
    };
  }

  componentDidMount() {
    if (this.zoomedImage.current) {
      this.zoomedImage.current.focus();
    }
    window.addEventListener('scroll', this.disableScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.disableScroll);
  }

  disableScroll = () => {
    const { zoomInfo: [, parentDivStyle] } = this.props;
    window.scrollTo(0, parentDivStyle.top);
  };

  close = (_: React.SyntheticEvent, forceClose = false) => {
    // sends a reset callback after closing modalstate
    const { cancelBlur } = this.state;
    if (cancelBlur && !forceClose) return;
    const { reset } = this.props;
    this.setState({
      zoomClass: 'zoom chide',
    }, async () => {
      // delay to display closing keyframe
      await delay(500);
      reset();
    });
  };

  toggleComments = () => {
    const { commentsShowing } = this.state;
    const { zoomInfo: [, parentDivStyle] } = this.props;
    if (this.zoomedImage.current && !commentsShowing) {
      const { current: { clientHeight: cardHeight, children } } = this.zoomedImage;
      const [, image] = children;
      const { clientHeight: imageHeight } = image;
      this.setState({
        commentsShowing: {
          width: parentDivStyle.parentWidth,
          height: imageHeight + (window.innerHeight - cardHeight - 25),
        },
        cancelBlur: true,
      });
      return;
    }
    // need to reinstate focus for blur to work again
    if (this.zoomedImage.current) {
      this.zoomedImage.current.focus();
    }
    this.setState({ commentsShowing: null, cancelBlur: false });
  };

  render() {
    const {
      zoomInfo: [pinInformation, parentDivStyle],
      pinImage,
      deletePin,
      user: { authenticated },
      handleNewComment,
      updateTags,
    } = this.props;
    const {
      commentsShowing, zoomClass,
    } = this.state;
    const totalPins = (pinInformation.savedBy) ? pinInformation.savedBy.length : 0;
    const formattedDescription = getFormattedDescription(pinInformation.imgDescription);
    return (
      <>
        <div className="modal-overlay" />
        <Card
          sx={{
            width: parentDivStyle.parentWidth,
            top: parentDivStyle.top,
          }}
          className={zoomClass}
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
                    onMouseDown={(e) => e.preventDefault()}
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
                <Link
                  component={RouterLink}
                  underline="none"
                  to={
                    `/profile/${getUserLinkQuery(pinInformation.owner)}`
                  }
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => this.close(e, true)}
                >
                  {pinInformation.owner.name}
                </Link>
                <br />
                <span style={{ marginLeft: 0 }}>
                  {formatDate(pinInformation.createdAt)}
                </span>
              </>
            )}
            titleTypographyProps={{ fontWeight: 'bold' }}
            subheaderTypographyProps={{ fontWeight: 'bold' }}
          />
          <CardContent sx={{
            background: parentDivStyle.isNoFit && !commentsShowing ? 'black' : '',
            padding: 0,
            '&:last-child': { pb: 0 },
          }}
          >
            { !commentsShowing ? (
              <CardMedia
                component="img"
                image={pinInformation.imgLink}
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
                  closePin={(e: React.SyntheticEvent) => this.close(e, true)}
                  updateTags={updateTags}
                />
              )}
          </CardContent>

        </Card>
      </>
    );
  }

}

export default PinZoom;
