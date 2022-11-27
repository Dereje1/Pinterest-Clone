// displays pin zoom modal
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Badge from '@mui/material/Badge';
import PinDropIcon from '@mui/icons-material/PinDrop';
import { styled } from '@mui/styles';
import ModalActions from './ModalActions';
import {
  delay, getNewImageWidth, getPinners, getFormattedDescription,
} from '../../utils/utils';
import './modal.scss';

const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    right: 16,
    top: 0,
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
      firstShow: false,
      parentDivStyle: { top: 80, width: '90%' },
    };
  }

  componentDidMount() {
    const { zoomInfo } = this.props;
    const { parentDivStyle } = this.state;
    const [, browserTop] = zoomInfo;
    const divCopy = JSON.parse(JSON.stringify(parentDivStyle));
    divCopy.top = browserTop;
    window.addEventListener('click', this.outsideClick);
    window.addEventListener('touchmove', this.outsideClick);
    window.addEventListener('scroll', this.disableScroll);
    this.setState({
      show: true,
      firstShow: true,
      parentDivStyle: divCopy,
    }, async () => { await delay(1000); });
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    window.removeEventListener('click', this.outsideClick);
    window.removeEventListener('scroll', this.disableScroll);
    window.removeEventListener('touchmove', this.outsideClick);
  };

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
  };

  disableScroll = () => {
    const { zoomInfo: zoomDist } = this.props;
    window.scrollTo(0, zoomDist[1]);
  };

  close = () => {
    // sends a reset callback after closing modalstate which clears
    // the message field
    const { reset } = this.props;
    this.removeListeners();
    this.setState({
      show: false,
    }, async () => {
      // delay to display closing keyframe
      await delay(500);
      reset();
    });
  };

  handleImage = (i) => {
    const { naturalWidth, naturalHeight } = i.target;
    const { parentDivStyle } = this.state;
    const newDivStyle = getNewImageWidth({ naturalWidth, naturalHeight, parentDivStyle });
    // const pcopy = JSON.parse(JSON.stringify(parentDivStyle));
    this.setState({
      parentDivStyle: newDivStyle,
    });
  };


  render() {
    const {
      zoomInfo, pinImage, deletePin,
    } = this.props;
    const { show, parentDivStyle } = this.state;
    if (!zoomInfo.length) return null;
    const [pinInformation] = zoomInfo;
    const totalPins = (pinInformation.savedBy) ? pinInformation.savedBy.length : 0;
    const pinnedBy = totalPins ? getPinners(pinInformation.savedBy) : '';
    const formattedDescription = getFormattedDescription(pinInformation.imgDescription);
    const [, day, mth, year] = new Date(pinInformation.createdAt).toUTCString().split(' ');
    return (
      <>
        {show && <div className="modal-overlay" />}
        <Card sx={parentDivStyle} className={show ? 'zoom cshow' : 'zoom chide'}>
          <CardHeader
            action={(
              <>
                <ModalActions
                  element={pinInformation}
                  pinImage={pinImage}
                  deletePin={deletePin}
                  reset={this.close}
                />
                <StyledBadge badgeContent={totalPins} color="secondary" showZero>
                  <Tooltip title={pinnedBy}>
                    <PinDropIcon style={{ fontSize: parentDivStyle.pinnersSize }} />
                  </Tooltip>
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
                  {`${day} ${mth} ${year}`}
                </span>
              </>
            )}
            titleTypographyProps={{ fontSize: parentDivStyle.titleSize, fontWeight: 'bold' }}
            subheaderTypographyProps={{ fontSize: parentDivStyle.subTitleSize, fontWeight: 'bold' }}
          />
          <CardMedia
            component="img"
            image={pinInformation.imgLink}
            onLoad={this.handleImage}
            id="pin-zoom"
          />
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
};
