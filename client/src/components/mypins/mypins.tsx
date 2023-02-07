// user page only for authenticated users
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import PinCreate from './pincreatemodal';
import ImageBuild from '../imagebuild/Imagebuild';
import RESTcall from '../../crud'; // pin CRUD
import { getProviderIcons, Loading, UserPinsSelector } from '../common/common';
import {
  providerIconsType, userType, PinType,
} from '../../interfaces';

const providerIcons = getProviderIcons({ fontSize: 45 });

interface getUserInfoProps {
  service: string
  displayName: string | null
  username: string | null
}
const getUserInfo = ({ service, displayName, username }: getUserInfoProps) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  }}
  >
    <Avatar sx={{
      mb: 2,
      width: 52,
      height: 52,
      bgcolor: providerIcons[service as keyof providerIconsType].color,
    }}
    >
      {providerIcons[service as keyof providerIconsType].icon}
    </Avatar>
    <Typography variant="h4">
      {displayName}
    </Typography>
    <Typography style={{ marginLeft: 15 }}>
      {service === 'google' ? username : `@${username}`}
    </Typography>
  </div>
);

interface MypinsProps {
  user: userType
}

interface MypinsState {
  displayPinCreate: boolean
  pinList: PinType[]
  showDeleteImageModal: boolean
  deletableImgInfo: PinType | null,
  ready: boolean,
  displaySetting: string,
}

export class Mypins extends Component<MypinsProps, MypinsState> {

  constructor(props: MypinsProps) {
    super(props);
    this.state = {
      displayPinCreate: false, // controls pin creation modal
      pinList: [], // collects the pins user owns and saved
      showDeleteImageModal: false,
      deletableImgInfo: null,
      ready: false,
      displaySetting: 'created',
    };
  }

  async componentDidMount() {
    // get all pins and filter by owned and saved and then concatenate and set state
    const { profilePins } = await RESTcall({
      address: '/api/mypins',
      method: 'get',
      payload: undefined,
    });
    this.setState({
      pinList: profilePins,
      ready: true,
    });
  }

  // adds a new pin to the db
  async addPic(pinJSON: {imgDescription: string, imgLink: string | ArrayBuffer}) {
    // copy then add pin to db and then update client state (in that order)
    const { pinList } = this.state;
    this.setState({ ready: false });
    const newPin = await RESTcall({
      address: '/api/newpin',
      method: 'post',
      payload: pinJSON,
    });
    const addedPin = {
      ...newPin,
      owns: true,
      hasSaved: false,
    };
    this.setState({
      pinList: [...pinList, addedPin],
      ready: true,
      displayPinCreate: false,
      displaySetting: 'created',
    });
  }

  pinForm() { // display pin creation modal
    this.setState({
      displayPinCreate: true,
    });
  }

  deletePic({ _id, owns }: {_id: string, owns: boolean}) {
    const { pinList, displayPinCreate } = this.state;
    if (displayPinCreate) return;
    this.setState({
      pinList: pinList.filter((p) => p._id !== _id),
      showDeleteImageModal: false,
      deletableImgInfo: null,
    }, async () => {
      await RESTcall({
        address: owns ? `/api/${_id}` : `/api/unpin/${_id}`,
        method: owns ? 'delete' : 'put',
        payload: undefined,
      });
    });
  }

  render() {
    const { user, user: { authenticated } } = this.props;
    const {
      displayPinCreate, showDeleteImageModal,
      deletableImgInfo, pinList,
      ready, displaySetting,
    } = this.state;
    if (!authenticated) return null;
    if (!ready) return <Loading marginTop={100} />;

    const pins = pinList.filter((pin) => (displaySetting === 'created' ? Boolean(pin.owns) : Boolean(pin.hasSaved)));
    return (
      <>
        <div style={{
          marginTop: 80,
          marginLeft: 'auto',
          marginRight: 'auto',
          width: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        >
          {getUserInfo(user)}
          <div style={{ marginRight: 18 }}>
            <UserPinsSelector
              displaySetting={displaySetting}
              setDisplaySetting={(val) => this.setState({ displaySetting: val })}
            />
          </div>

          <Fab
            id="createpin"
            color="default"
            aria-label="add"
            onClick={() => this.pinForm()}
            sx={{ marginTop: 1, zIndex: 1 }}
          >
            <AddIcon fontSize="large" />
          </Fab>
        </div>
        {
          pins.length
            ? (
              <ImageBuild
                pinImage={false}
                deletePin={(pin) => {
                  if (pin.owns) {
                    this.setState({
                      showDeleteImageModal: true,
                      deletableImgInfo: pin,
                    });
                  } else {
                    this.deletePic(pin);
                  }
                }}
                pinList={pins}
                ready={ready}
                displayBrokenImage
                user={user}
              />

            )
            : (
              <Box
                sx={{
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginTop: 10,
                  padding: 2,
                  backgroundColor: '#eeeeee',
                }}
              >
                { displaySetting === 'saved' ? (
                  <Typography variant="h6" textAlign="center">
                    You have no pins saved, you can save some from the
                    {' '}
                    <Link to="/">home</Link>
                    {' '}
                    page
                  </Typography>
                )
                  : (
                    <>
                      <Typography variant="h4" style={{ textAlign: 'center' }}>
                        Welcome!
                      </Typography>
                      <Typography variant="h6" textAlign="center">
                        You have not created any pins, you can create some
                        by clicking on the button above
                      </Typography>
                    </>
                  )}
              </Box>
            )
        }
        {displayPinCreate && (
          <PinCreate
            reset={() => this.setState({ displayPinCreate: false })}
            savePin={(pinJSON) => this.addPic(pinJSON)}
          />
        )}
        { showDeleteImageModal && (
          <Dialog
            open={showDeleteImageModal}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {`Permanently delete ${deletableImgInfo && deletableImgInfo.imgDescription}?`}
            </DialogTitle>
            <DialogActions>
              <Button
                id="cancel-delete-alert"
                onClick={() => this.setState({
                  showDeleteImageModal: false,
                  deletableImgInfo: null,
                })}
              >
                Cancel
              </Button>
              <Button
                id="resume-delete-alert"
                onClick={() => {
                  if (deletableImgInfo !== null) {
                    this.deletePic(deletableImgInfo);
                  }
                }}
                autoFocus
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </>
    );
  }

}

export const mapStateToProps = ({ user }:{user: userType}) => ({ user });

export default connect(mapStateToProps)(Mypins);
