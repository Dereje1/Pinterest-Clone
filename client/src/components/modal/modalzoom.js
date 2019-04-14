// displays pin zoom modal
import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import Masonry from 'react-masonry-component';
import PropTypes from 'prop-types';
import './modal.scss';

class PinZoom extends Component {

  constructor(props) {
    super(props);
    // initialize modal show state to false
    this.state = {
      show: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { message } = this.props;
    if ((prevProps.message === false) && (message === true)) {
      this.setState({
        show: true,
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

  open() {
    this.setState({
      show: true,
    });
  }

  render() {
    // use total pins to display how many have saved image
    // components brings in as prop zoominfo etire object containing pin information
    const { zoomInfo } = this.props;
    const { show } = this.state;
    if (!zoomInfo.length) return null;
    const pinInformation = zoomInfo[0];
    const buttonInformation = zoomInfo[1];

    const totalPins = (pinInformation.savedBy) ? pinInformation.savedBy.length : 0;
    return (
      <Modal
        show={show}
        onHide={this.close}
        container={this}
        aria-labelledby="contained-modal-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-zoom">
            <div id="zoomdesc">{pinInformation.imgDescription}</div>
            <div id="zoomowner">{`Linked By: ${pinInformation.owner}`}</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="zoomarea">
            <Masonry>
              <img alt="" className="pinZoom" src={pinInformation.imgLink} />
            </Masonry>
          </div>
        </Modal.Body>
        <Modal.Footer id="zoomfooter">
          <span id="zoomtack">
            <i className="fa fa-thumb-tack" aria-hidden="true" />
            {`  ${totalPins}`}
          </span>
          {buttonInformation}
        </Modal.Footer>
      </Modal>
    );
  }

}

export default PinZoom;


PinZoom.propTypes = {
  message: PropTypes.bool.isRequired,
  zoomInfo: PropTypes.arrayOf(PropTypes.any).isRequired,
  reset: PropTypes.func.isRequired,
};
