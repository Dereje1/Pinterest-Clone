// displays pin zoom modal
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './modal.scss';

class PinZoom extends Component {

  constructor(props) {
    super(props);
    // initialize modal show state to false
    this.state = {
      show: false,
      firstShow: false,
      parentDivStyle: { top: 80, width: '90%' },
    };
  }

  componentDidUpdate(prevProps) {
    const { message, zoomInfo } = this.props;
    const { parentDivStyle } = this.state;
    if ((prevProps.message === false) && (message === true)) {
      const divCopy = JSON.parse(JSON.stringify(parentDivStyle));
      // use scroll dist on zoom call to set top of zoom div
      divCopy.top = zoomInfo[2] + 10;
      if (prevProps.zoomInfo.length
        && prevProps.zoomInfo[0].imgDescription !== zoomInfo[0].imgDescription) {
        divCopy.width = window.innerWidth;
      }
      window.addEventListener('click', this.outsideClick);
      window.addEventListener('touchmove', this.outsideClick);
      window.addEventListener('scroll', this.disableScroll);
      this.setState({
        show: true,
        firstShow: true,
        parentDivStyle: divCopy,
      });
    }
    if ((prevProps.message === true) && (message === false)) {
      this.setState({
        show: false,
      }, () => this.removeListeners());
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    window.removeEventListener('click', this.outsideClick);
    window.removeEventListener('scroll', this.disableScroll);
    window.removeEventListener('touchmove', this.outsideClick);
  }

  outsideClick = (e) => {
    // if modal and outside click/touch remove modal
    const { show, firstShow } = this.state;
    const closestElement = e.target.closest('.zoom');
    // prevent keyframe animation on running with first load
    if (!closestElement && firstShow) {
      this.setState({ firstShow: false });
      return;
    }
    if (!closestElement && show) this.close();
  }

  disableScroll = () => {
    const { zoomInfo: zoomDist } = this.props;
    window.scrollTo(0, zoomDist[2]);
  }

  close = () => {
    // sends a reset callback after closing modalstate which clears
    // the message field
    const { reset } = this.props;
    this.removeListeners();
    this.setState({
      show: false,
    }, () => reset());
  }

  getNewImageWidth = (imgDim) => {
    // dynamically resize image
    const { naturalWidth: width, naturalHeight: height } = imgDim;
    let { innerWidth, innerHeight } = window;
    // parameter for innerwidth/height adjustment with mobile consideration
    // top(70) + headingheight(50 / 25) + button height (50 / 25)
    innerHeight = innerHeight < 500 ? innerHeight - 120 : innerHeight - 170;
    // minor x direction adjustment for padding too
    innerWidth -= (innerWidth * 0.02);
    const aspectRatio = width / height;
    let newWidth;
    if (width < innerWidth && height < innerHeight) {
      // already fits, return value if above 500 or else
      // expand to 500
      newWidth = width < 500 && innerWidth > 500 ? 500 : width;
    } else if (width > innerWidth) {
      newWidth = innerWidth;
      // test new height with Aspect ratio
      const newHeight = newWidth / aspectRatio;
      // test again if new height is less than screen height
      newWidth = newHeight < innerHeight
        ? newWidth
        : aspectRatio * innerHeight;
    } else { // means height > innerheight
      newWidth = aspectRatio * innerHeight;
    }
    return newWidth;
  }

  handleImage = (i) => {
    const { naturalWidth, naturalHeight } = i.target;
    const { parentDivStyle } = this.state;
    const newWidth = this.getNewImageWidth({ naturalWidth, naturalHeight });
    const pcopy = JSON.parse(JSON.stringify(parentDivStyle));
    pcopy.width = `${newWidth}px`;
    pcopy.small = newWidth < 350;
    this.setState({
      parentDivStyle: pcopy,
    });
  }

  pinners = pinInformation => (pinInformation.savedBy.length > 3
    ? `${pinInformation.savedBy.slice(0, 3).join(', ')} and ${pinInformation.savedBy.length - 3} others`
    : pinInformation.savedBy.join(', '))

  render() {
    const { zoomInfo } = this.props;
    const { show, parentDivStyle } = this.state;
    if (!zoomInfo.length) return null;
    const pinInformation = zoomInfo[0];
    const buttonInformation = zoomInfo[1];
    const totalPins = (pinInformation.savedBy) ? pinInformation.savedBy.length : 0;
    const pinnedBy = totalPins ? this.pinners(pinInformation) : '';
    return (
      <div
        className={show ? 'zoom cshow' : 'zoom chide'}
        style={parentDivStyle}
      >
        <div className="header">
          <span id="zoomtitle">
            <div id="zoomdesc">{pinInformation.imgDescription}</div>
            <div id="zoomowner">{`${pinInformation.owner}`}</div>
          </span>
          <span id="zoomtack" title={pinnedBy} className={parentDivStyle.small ? 'small' : ''}>
            <i className="fa fa-thumb-tack" aria-hidden="true" />
            {`  ${totalPins}`}
          </span>
          <i className="fa fa-close" onClick={this.close} aria-hidden="true" />
        </div>

        <img
          alt=""
          className="pinzoom"
          src={pinInformation.imgLink}
          onLoad={this.handleImage}
        />

        <div className="footer">
          {buttonInformation}
        </div>
      </div>
    );
  }

}

export default PinZoom;


PinZoom.propTypes = {
  // turns modal on/off based on change
  message: PropTypes.bool.isRequired,
  // [picobject, overlay button type, last scroll distance]
  zoomInfo: PropTypes.arrayOf(PropTypes.any).isRequired,
  // callback to caller to turn modal off
  reset: PropTypes.func.isRequired,
};
