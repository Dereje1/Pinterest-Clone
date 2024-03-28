// displays pin zoom modal
import React, { Component, createRef } from 'react';
/* MUI */
import Card from '@mui/material/Card';
import { CardContent } from '@mui/material';
/* local components and utility */
import ModalHeader from './Header/ModalHeader';
import Comments from './Back/Comments';
import SwipableImage from './Front/SwipableImage';
import { delay } from '../../../utils/utils';
import {
  PinType, userType, zoomedImageInfoType, imageMetadataType,
} from '../../../interfaces';
import './modal.scss';

interface PinZoomProps {
  zoomInfo: zoomedImageInfoType,
  user: userType
  reset: () => void
  pinImage: (pin: PinType) => void
  deletePin: ((pin: PinType) => void) | null
  handleNewComment: (newComment: string) => void
  updateTags: (query: string) => void
  displayLogin: () => void
  onSlidePin: (newIndex: number) => void
  resetParentDivStyle: (metadata: imageMetadataType | null) => zoomedImageInfoType['parentDivStyle'] | null
}

interface PinZoomState {
  commentsShowing: { width: number, height: number } | null
  cancelBlur: boolean
  zoomClass: string
  imgMetaData: imageMetadataType | null
}

// The PinZoom component displays a zoomed-in view of a pin in a modal.
// It also provides functionality to view and add comments to the pin.
export class PinZoom extends Component<PinZoomProps, PinZoomState> {

  // Reference to the zoomed image element
  private zoomedImage = createRef<HTMLDivElement>();

  constructor(props: PinZoomProps) {
    super(props);
    this.state = {
      commentsShowing: null,
      cancelBlur: false,
      zoomClass: 'zoom cshow',
      imgMetaData: null,
    };
  }

  // Focus on the zoomed image when the component mounts
  componentDidMount() {
    if (this.zoomedImage.current) {
      this.zoomedImage.current.focus();
    }
  }

  // Close the modal and reset the state
  close = (_: React.SyntheticEvent, forceClose = false) => {
    const { cancelBlur } = this.state;
    if (cancelBlur && !forceClose) return;
    const { reset } = this.props;
    this.setState({
      zoomClass: 'zoom chide',
    }, async () => {
      await delay(500);
      reset();
    });
  };

  // Calculate and set the state for showing comments
  handleCommentsNotShowing = (zoomedImage: HTMLDivElement, updatedDivStyle: zoomedImageInfoType['parentDivStyle']) => {
    const [header] = zoomedImage.children;
    this.setState({
      commentsShowing: {
        width: updatedDivStyle.parentWidth,
        height: window.innerHeight - header.clientHeight - 25,
      },
      cancelBlur: true,
    });
  };

  // Handle the case when comments are currently showing
  handleCommentsShowing = (zoomedImage: HTMLDivElement) => {
    zoomedImage.focus();
    this.setState({ commentsShowing: null, cancelBlur: false });
  };

  // Toggle the visibility of the comments section
  toggleComments = () => {
    const { commentsShowing, imgMetaData } = this.state;
    const { resetParentDivStyle } = this.props;
    const updatedDivStyle = resetParentDivStyle(imgMetaData);
    if (this.zoomedImage.current && updatedDivStyle) {
      if (!commentsShowing) {
        this.handleCommentsNotShowing(this.zoomedImage.current, updatedDivStyle);
      } else {
        this.handleCommentsShowing(this.zoomedImage.current);
      }
    }
  };

  // Render the PinZoom component
  render() {
    const {
      zoomInfo: { pin: pinInformation, parentDivStyle },
      pinImage,
      deletePin,
      user: { authenticated },
      handleNewComment,
      updateTags,
      displayLogin,
      zoomInfo,
      onSlidePin,
    } = this.props;
    const {
      commentsShowing, zoomClass,
    } = this.state;

    return (
      <>
        <div className="modal-overlay" />
        <Card
          sx={{
            width: parentDivStyle.parentWidth,
            top: parentDivStyle.top,
            background: commentsShowing ? '' : 'rgba(0, 0, 0, 0.7)',
          }}
          className={zoomClass}
          onBlur={this.close}
          ref={this.zoomedImage}
          tabIndex={0}
        >
          <ModalHeader
            authenticated={authenticated}
            commentsShowing={Boolean(commentsShowing)}
            pinInformation={pinInformation}
            closePin={this.close}
            deletePin={deletePin}
            displayLogin={displayLogin}
            pinImage={pinImage}
            toggleComments={this.toggleComments}
          />
          <CardContent sx={{
            background: parentDivStyle.isNoFit && !commentsShowing ? 'black' : '',
            padding: 0,
            '&:last-child': { pb: 0 },
          }}
          >
            {!commentsShowing ? (
              <SwipableImage
                zoomInfo={zoomInfo}
                onSlidePin={onSlidePin}
                onSetImageMetaData={(m) => this.setState({ imgMetaData: m })}
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
                  displayLogin={displayLogin}
                />
              )}
          </CardContent>
        </Card>
      </>
    );
  }

}

export default PinZoom;
