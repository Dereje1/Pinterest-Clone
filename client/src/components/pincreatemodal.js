// displays modal that creates pin
import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import Masonry from 'react-masonry-component';
import PropTypes from 'prop-types';

class PinCreate extends Component {

  constructor(props) {
    super(props);
    // initialize modal show state to false
    this.state = {
      show: false,
      picPreview: '../client/public/images/NO-IMAGE.png', // on erroneous image links
      description: '',
      saveDisabled: true, // parameter controls save button state
    };
  }

  componentDidUpdate(prevProps) { // compare previous props to current efore showing
    const { message } = this.props;
    if ((prevProps.message === false) && (message === true)) {
      this.setState({
        show: true,
      });
    }
  }

  close = () => {
    // note my modified modal now sends a reset callback after closing modalstate which clears
    // the message field, not also to reset pic url to erroneous image png before exit
    const { reset } = this.props;
    this.setState({
      show: false,
      picPreview: '../client/public/images/NO-IMAGE.png',
    }, () => reset());
  }

  open = () => {
    this.setState({
      show: true,
      saveDisabled: true,
    });
  }

  picprocess = (e) => { // processes picture on change of text box
    let imglinkHttps = e.target.value;
    // convert to https to avoid mixed content warning in console
    if (e.target.value.split(':')[0] === 'http') {
      imglinkHttps = `${e.target.value.split(':')[0]}s:${e.target.value.split(':')[1]}`;
    }
    this.setState({
      picPreview: imglinkHttps,
    }, () => this.validation());
  }

  discprocess = (e) => { // processes description entered for new pin
    this.setState({ description: e.target.value }, () => this.validation());
  }

  invalidImage = () => { // error handler for invalid/broken pic routes can not save in this state
    this.setState({
      picPreview: '../client/public/images/NO-IMAGE.png',
      saveDisabled: true,
    });
  }

  validation = () => {
    const { description } = this.state;
    this.setState({
      saveDisabled: description.trim().length < 5,
    });
  }

  savePic() { // ready to save pin
    const { userInfo, savePin } = this.props;
    const { picPreview, description, saveDisabled } = this.state;
    if (saveDisabled) return;
    // prepare JSON for POST api
    const pinJSON = {
      owner: userInfo.username,
      imgDescription: description,
      imgLink: picPreview,
      timeStamp: Date.now(),
      savedBy: [],
    };
    // save into db and close modal
    savePin(pinJSON);
    this.close();
  }

  addpin() { // body of modal
    const { picPreview } = this.state;
    return (
      <div id="addpin">
        <div id="picdisplay">
          <Masonry>
            <img alt="" onError={() => this.invalidImage()} className="pinTest" src={picPreview} />
          </Masonry>
        </div>
        <div id="formarea">
          <p>Add a description</p>
          <textarea
            id="textdesc"
            placeholder="Description..."
            maxLength="28"
            onChange={e => this.discprocess(e)}
          />
          <p>Paste Link to Image</p>
          <textarea
            id="textlink"
            placeholder="http://"
            onChange={e => this.picprocess(e)}
          />

        </div>
      </div>
    );
  }

  render() {
    const { show, saveDisabled } = this.state;
    return (
      <Modal
        show={show}
        onHide={this.close}
        container={this}
        aria-labelledby="contained-modal-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title">Create Pin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.addpin()}
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="danger" onClick={() => this.savePic()} disabled={saveDisabled}>Save</Button>
        </Modal.Footer>
      </Modal>
    );
  }

}

export default PinCreate;


PinCreate.propTypes = {
  message: PropTypes.bool.isRequired,
  userInfo: PropTypes.shape(PropTypes.shape).isRequired,
  reset: PropTypes.func.isRequired,
  savePin: PropTypes.func.isRequired,
};
