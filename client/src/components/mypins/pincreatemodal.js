// displays modal that creates pin
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import imageBroken from './NO-IMAGE.png';
import './pincreate.scss';

class PinCreate extends Component {

  constructor(props) {
    super(props);
    // initialize modal show state to false
    this.state = {
      show: false,
      picPreview: imageBroken, // on erroneous image links
      description: '',
      saveDisabled: true, // parameter controls save button state
    };
  }

  componentDidMount() {
    this.setState({ justMounted: true });
  }


  componentDidUpdate(prevProps) { // compare previous props to current efore showing
    const { message } = this.props;
    if ((prevProps.message === false) && (message === true)) {
      window.scrollTo(0, 0);
      this.setState({
        show: true,
        description: '',
        picPreview: imageBroken,
        saveDisabled: true,
        justMounted: false,
      });
    }
  }

  disableScroll = () => window.scrollTo(0, 0);

  close = () => {
    // note my modified modal now sends a reset callback after closing modalstate which clears
    // the message field, not also to reset pic url to erroneous image png before exit
    const { reset } = this.props;
    this.setState({
      show: false,
      picPreview: imageBroken,
    }, () => reset());
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
      picPreview: imageBroken,
      saveDisabled: true,
    });
  }

  validation = () => {
    // check for both valid pic and description before allowing save
    const { description, picPreview } = this.state;
    this.setState({
      saveDisabled: (description.trim().length < 5) || picPreview === imageBroken,
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
    const { picPreview, description } = this.state;
    return (
      <React.Fragment>
        <div className="newpinholder">
          <img alt="newpin" onError={() => this.invalidImage()} className="pinTest" src={picPreview} />
        </div>
        <div className="formarea">
          <textarea
            className="textdesc"
            placeholder="Description..."
            maxLength="28"
            onChange={e => this.discprocess(e)}
            value={description}
          />
          <textarea
            className="textlink"
            placeholder="http://"
            onChange={e => this.picprocess(e)}
            value={picPreview === imageBroken ? '' : picPreview}
          />
        </div>
      </React.Fragment>
    );
  }

  render() {
    const { show, saveDisabled, justMounted } = this.state;
    if (justMounted) return null;
    return (
      <div
        className={show ? 'pincreate cshow' : 'pincreate chide'}
      >
        <div className="header">
          <span id="pincreatetitle">
            <div id="pincreatedesc">Create Pin</div>
          </span>
          <i className="fa fa-close" onClick={this.close} aria-hidden="true" />
        </div>
        {this.addpin()}
        <div className="footer">
          <button type="submit" onClick={() => this.savePic()} className="savebutton" disabled={saveDisabled}>Save</button>
        </div>
      </div>
    );
  }

}

export default PinCreate;


PinCreate.propTypes = {
  // turns modal on/off based on change
  message: PropTypes.bool.isRequired,
  // data used for pin creation
  userInfo: PropTypes.shape(PropTypes.shape).isRequired,
  // callback in mypins to turn modal off
  reset: PropTypes.func.isRequired,
  // POST request via axios
  savePin: PropTypes.func.isRequired,
};
