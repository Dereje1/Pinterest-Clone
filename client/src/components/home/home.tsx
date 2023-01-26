// homepage for both logged in and guest users
import React, { Component } from 'react';
import { connect } from 'react-redux';
import RESTcall from '../../crud';
import ImageBuild from '../imagebuild/Imagebuild';
import { shuffleImages, getFilteredPins } from '../../utils/utils';

interface Pinner  { 
  name: string, 
  service: string, 
  userId: string 
}

interface comment  { 
  _id: string,
  displayName: string, 
  comment: string, 
  createdAt: string 
}

interface tag  { 
  _id: string,
  tag: string,
}

interface Pin  {
  _id: string,
  imgDescription: string,
  imgLink: string,
  owner: { name: string, service: string, userId: string },
  savedBy: Pinner[],
  owns: boolean,
  hasSaved: boolean,
  createdAt: string,
  comments: comment[],
  tags: tag[],
}

interface HomeProps  {
  user: {
    authenticated: boolean,
    userIp: string,
    username: string | null,
    displayName: string | null,
    providers: {
        twitter: boolean,
        google: boolean,
        github: boolean
    }
  },
  search: {
    term: string | null,
    tagSearch: boolean
  }
};

interface HomeState {
  pinList: Pin[],
  ready: boolean
};

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

export const mapStateToProps = ({user, search}: HomeProps) => ({user, search});

export default connect(mapStateToProps)(Home);
