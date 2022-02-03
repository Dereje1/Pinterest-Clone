// displays modal that creates pin
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import imageBroken from './NO-IMAGE.png';
import './pincreate.scss';

const validateURL = (string) => {
  try {
    const url = new URL(string);
    if (url.protocol === 'data:' || url.protocol === 'https:') return string;
    if (url.protocol === 'http:') {
      // convert to https to avoid mixed content warning in console
      return `${string.split(':')[0]}s:${string.split(':')[1]}`;
    }
  } catch (_) {
    return null;
  }
  return null;
};

class PinCreate extends Component {

  constructor(props) {
    super(props);
    // initialize modal show state to false
    this.state = {
      show: false,
      picPreview: '', // on erroneous image links
      description: '',
      isError: true,
      showErrorImage: true,
    };
  }

  componentDidMount() {
    this.setState({ justMounted: true });
  }


  componentDidUpdate(prevProps, prevState) { // compare previous props to current efore showing
    const { message } = this.props;
    const { isError } = this.state;
    if ((prevProps.message === false) && (message === true)) {
      window.scrollTo(0, 0);
      this.setState({
        show: true,
        description: '',
        picPreview: imageBroken,
        justMounted: false,
      });
    }
    if (!prevState.isError && isError) {
      this.setState({ showErrorImage: true });
    }
    if (prevState.isError && !isError) {
      this.setState({ showErrorImage: false });
    }
  }

  // disableScroll = () => window.scrollTo(0, 0);

  close = () => {
    const { reset } = this.props;
    this.setState({
      show: false,
      picPreview: '',
      description: '',
    }, () => reset());
  };

  processImage = (e) => { // processes picture on change of text box
    const imgLink = validateURL(e.target.value);
    if (!imgLink) return;
    this.setState({
      picPreview: imgLink,
      isError: false,
    });
  };

  savePic() { // ready to save pin
    const { userInfo, savePin } = this.props;
    const { picPreview, description, showErrorImage } = this.state;
    if (showErrorImage || description.length < 5) return;
    // prepare JSON for POST api
    const pinJSON = {
      owner: {
        name: userInfo.displayname,
        service: userInfo.service,
        id: userInfo.userId,
      },
      imgDescription: description,
      imgLink: picPreview,
    };
    // save into db and close modal
    savePin(pinJSON);
    this.close();
  }

  addpin() { // body of modal
    const {
      picPreview, description, isError, showErrorImage,
    } = this.state;
    return (
      <React.Fragment>
        <div className="newpinholder">
          <img
            alt="newpin"
            className="pinTest"
            src={showErrorImage ? imageBroken : picPreview}
            onError={() => this.setState({ isError: true })}
          />
        </div>
        <div className="formarea">
          <textarea
            className="textdesc"
            placeholder="Description..."
            maxLength="28"
            onChange={({ target: { value } }) => value.length <= 20
             && this.setState({ description: value })}
            value={description}
          />
          <textarea
            className="textlink"
            placeholder={'Paste image address here \nhttp://...'}
            onChange={e => this.processImage(e)}
            value={isError ? '' : picPreview}
          />
        </div>
      </React.Fragment>
    );
  }

  render() {
    const {
      show, justMounted, description, showErrorImage,
    } = this.state;
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
          <button type="submit" onClick={() => this.savePic()} className="savebutton" disabled={showErrorImage || description.length < 5}>Save</button>
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
