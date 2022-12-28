import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ImageBuild from '../imagebuild/Imagebuild';
import SignIn from '../signin/signin';
import RESTcall from '../../crud';
import { getProviderIcons } from '../common/common';
import error from '../mypins/error.png';

const providerIcons = getProviderIcons({ fontSize: 25 });

const Profile = () => {
  const [pinsOwned, setPinsOwned] = useState([]);
  const [pinsSaved, setPinsSaved] = useState([]);
  const [ready, setReady] = useState(false);
  const [displaySetting, setDisplaySetting] = useState('created');
  const [displayLogin, setDisplayLogin] = useState(false);

  const [userid, service, displayName] = useParams().userInfo.split('-');
  const { pathname } = useLocation();
  const history = useHistory();
  const loggedInUser = useSelector(state => state.user);

  const getProfileData = async () => {
    setReady(false);
    const { createdPins, savedPins, redirect } = await RESTcall({ address: `/api/userProfile/${userid}` });
    if (redirect) {
      window.location.assign('/pins');
    }
    setPinsOwned(createdPins);
    setPinsSaved(savedPins);
    setReady(true);
  };

  useEffect(() => {
    getProfileData();
    setDisplaySetting('created');
  }, [pathname]);

  useEffect(() => {
    const userObjectIsAvailable = Boolean(Object.keys(loggedInUser).length);
    if (userObjectIsAvailable && !loggedInUser.authenticated) {
      setDisplayLogin(true);
    }
  }, [loggedInUser]);

  useLayoutEffect(() => {
    document.body.style.overflowY = 'scroll';
  });

  const pins = displaySetting === 'created' ? pinsOwned : pinsSaved;

  if (displayLogin) {
    return (
      <SignIn
        removeSignin={() => {
          history.push('/');
        }}
      />
    );
  }

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 60,
      }}
      >
        <Typography
          variant="h4"
          color="text.secondary"
        >
          PROFILE
        </Typography>
        <Avatar sx={{ bgcolor: providerIcons[service].color, mt: 3 }}>
          {providerIcons[service].icon}
        </Avatar>
        <Typography variant="h6" sx={{ mt: 3 }}>{displayName}</Typography>
        <ButtonGroup variant="text" aria-label="text button group" sx={{ mt: 3 }}>
          <Button
            color={displaySetting === 'created' ? 'secondary' : 'primary'}
            onClick={() => setDisplaySetting('created')}
          >
            Pins created
          </Button>
          <Button
            color={displaySetting === 'saved' ? 'secondary' : 'primary'}
            onClick={() => setDisplaySetting('saved')}
          >
            Pins saved
          </Button>
        </ButtonGroup>
      </div>

      { pins.length ? (
        <ImageBuild
          pinImage
          deletePin={null}
          pinList={pins}
          ready={ready}
          user={loggedInUser}
        />
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 60,
        }}
        >
          <Typography
            variant="h6"
            color="text.secondary"
          >
            {`${displayName} has not ${displaySetting} any pins`}
          </Typography>
          <img
            alt="no-pins-created"
            src={error}
            style={{ width: 250, height: 250 }}
          />
        </div>
      )}

    </>
  );
};
export default Profile;
