// homepage for both logged in and guest users
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import RESTcall from '../../crud';
import ImageBuild from '../imagebuild/Imagebuild';
import { shuffleImages, getFilteredPins } from '../../utils/utils';

export class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pinList: [], // stores all pins in db in state
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

  render() {
    const { user, user: { username }, search } = this.props;
    const { pinList, ready } = this.state;
    const filteredPins = getFilteredPins(pinList, search);
    if (username !== null) {
      return (
        <ImageBuild
          pinImage
          deletePin={null}
          pinList={filteredPins}
          ready={ready}
          user={user}
        />
      );
    }
    return null;
  }

}

export const mapStateToProps = (state) => state;

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
