// homepage for both logged in and guest users
import React, { Component } from 'react';
import { connect } from 'react-redux';
import RESTcall from '../../crud';
import ImageBuild from '../imagebuild/Imagebuild';
import { shuffleImages, getFilteredPins } from '../../utils/utils';
import { PinType, userType, searchType } from '../../interfaces';

interface HomeProps {
  user: userType
  search: searchType
}

interface HomeState {
  pinList: PinType[],
  ready: boolean
}

export class Home extends Component<HomeProps, HomeState> {

  constructor(props: HomeProps) {
    super(props);
    this.state = {
      pinList: [], // stores all pins in db in state
      ready: false,
    };
  }

  async componentDidMount() {
    const pinsFromDB = await RESTcall({
      address: '/api/home',
      method: 'get',
    });
    this.setState({
      pinList: shuffleImages([...pinsFromDB]),
      ready: true,
    });
  }

  render() {
    const { user, user: { username }, search: { term: searchTerm } } = this.props;
    if (username) {
      const { pinList, ready } = this.state;
      const filteredPins = getFilteredPins(pinList, searchTerm);
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

export const mapStateToProps = ({ user, search }: HomeProps) => ({ user, search });

export default connect(mapStateToProps)(Home);
