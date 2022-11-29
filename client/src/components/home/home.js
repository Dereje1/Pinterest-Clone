// homepage for both logged in and guest users
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import RESTcall from '../../crud';
import ImageBuild from '../imagebuild/imagebuild';
import SignIn from '../signin/signin';
import { shuffleImages, getFilteredPins } from '../../utils/utils';

export class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pinList: [], // stores all pins in db in state
      displaySignIn: false,
      ready: false,
    };
  }

  async componentDidMount() {
    const pinsFromDB = await RESTcall({
      address: '/api/?type=All',
      method: 'get',
    });
    this.setState({
      pinList: shuffleImages([...pinsFromDB]),
      ready: true,
    });
  }

  pinImage(element) { // saves a pic owned by somebody else into current users profile
    // can not do this unless logged in
    const {
      user: {
        displayName, username,
      },
    } = this.props;
    const { pinList } = this.state;
    if (username === 'Guest') {
      this.setState({
        displaySignIn: true,
      });
      return;
    }
    // add current pinner info to saved by array of pin
    const updatedPins = pinList.map((pin) => {
      if (pin._id === element._id) {
        return {
          ...pin,
          savedBy: [...pin.savedBy, displayName],
          hasSaved: true,
        };
      }
      return pin;
    });
    // update client then update db
    this.setState({
      pinList: updatedPins,
    }, async () => {
      await RESTcall({
        address: `/api/${element._id}`,
        method: 'put',
      });
    });
  }

  render() {
    const { user: { authenticated, username }, search } = this.props;
    const { pinList, displaySignIn, ready } = this.state;
    const filteredPins = getFilteredPins(pinList, search);
    if (username !== null) {
      return (
        <React.Fragment>
          {
            !authenticated && displaySignIn
              && (
                <SignIn
                  removeSignin={() => this.setState({ displaySignIn: false })}
                  caller="home"
                />
              )
          }
          <ImageBuild
            pinImage={e => this.pinImage(e)}
            deletePin={null}
            pinList={filteredPins}
            ready={ready}
          />
        </React.Fragment>
      );
    }
    return null;
  }

}

const mapStateToProps = state => state;

export default connect(mapStateToProps)(Home);

Home.defaultProps = {
  user: {},
  search: null,
};

Home.propTypes = {
  // authentication info from redux
  user: PropTypes.shape(PropTypes.shape),
  search: PropTypes.string,
};
