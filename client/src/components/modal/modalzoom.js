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
      imgStyle: { width: '90%', visibility: 'hidden' },
      parentDivStyle: { top: 80 },
    };
  }

  componentDidUpdate(prevProps) {
    const { message, zoomInfo } = this.props;
    if ((prevProps.message === false) && (message === true)) {
      this.setState({
        show: true,
        parentDivStyle: { top: zoomInfo[2] + 80 },
      });
    }
    if ((prevProps.message === true) && (message === false)) {
      this.setState({
        show: false,
      });
    }
  }

  close = () => {
    // note my modified modal now sends a reset callback after closing modalstate which clears
    // the message field
    const { reset } = this.props;
    this.setState({
      show: false,
    }, () => reset());
  }

  handleImage = (i) => {
    const { width, height } = i.target;
    const { innerWidth, innerHeight } = window;
    const ans = (width / height) / (innerWidth / innerHeight);
    let imgStyle;
    if (ans < 1.3) {
      imgStyle = {
        width: `${Math.floor(ans * 80)}%`,
      };
    } else {
      imgStyle = {
        width: '100%',
      };
    }

    this.setState({ imgStyle });
  }

  open() {
    this.setState({
      show: true,
    });
  }


  render() {
    // use total pins to display how many have saved image
    // components brings in as prop zoominfo etire object containing pin information
    const { zoomInfo } = this.props;
    const { show, imgStyle, parentDivStyle } = this.state;
    if (!zoomInfo.length) return null;
    const pinInformation = zoomInfo[0];
    const buttonInformation = zoomInfo[1];

    const totalPins = (pinInformation.savedBy) ? pinInformation.savedBy.length : 0;
    return (
      <div
        className={show ? 'zoom show' : 'zoom hide'}
        style={parentDivStyle}
      >
        <div className="header">
          <span id="zoomtitle">
            <div id="zoomdesc">{pinInformation.imgDescription}</div>
            <div id="zoomowner">{`Linked By: ${pinInformation.owner}`}</div>
          </span>
          <button type="submit" onClick={this.close}>Close</button>
        </div>

        <img
          alt=""
          className="pinzoom"
          style={imgStyle}
          src={pinInformation.imgLink}
          onLoad={this.handleImage}
        />

        <div className="footer">
          <span id="zoomtack">
            <i className="fa fa-thumb-tack" aria-hidden="true" />
            {`  ${totalPins}`}
          </span>
          {buttonInformation}
        </div>
      </div>
    );
  }

}

export default PinZoom;


PinZoom.propTypes = {
  message: PropTypes.bool.isRequired,
  zoomInfo: PropTypes.arrayOf(PropTypes.any).isRequired,
  reset: PropTypes.func.isRequired,
};
