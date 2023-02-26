import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ImageBuild from '../imagebuild/Imagebuild';
import { Loading, getProviderIcons, UserPinsSelector } from '../common/common';
import SignIn from '../signin/signin';
import RESTcall from '../../crud';
import { providerIconsType, userType } from '../../interfaces';
import error from '../mypins/error.png';

const providerIcons = getProviderIcons({ fontSize: 25 });

function Profile() {
  const [pinsOwned, setPinsOwned] = useState([]);
  const [pinsSaved, setPinsSaved] = useState([]);
  const [ready, setReady] = useState(false);
  const [displaySetting, setDisplaySetting] = useState('created');
  const [displayLogin, setDisplayLogin] = useState(false);
  const [retrievedUser, setRetrievedUser] = useState({ service: 'twitter', displayName: '' });

  const { userInfo }:{userInfo: string} = useParams();
  const { pathname } = useLocation();
  const history = useHistory();
  const loggedInUser = useSelector(({ user }:{user: userType}) => user);

  const getProfileData = async () => {
    try {
      setReady(false);
      const {
        createdPins, savedPins, user, redirect,
      } = await RESTcall({ address: `/api/userProfile/${userInfo}` });
      if (redirect) {
        history.push(redirect);
        return;
      }
      setPinsOwned(createdPins);
      setPinsSaved(savedPins);
      setRetrievedUser(user);
      setReady(true);
    } catch (err) {
      setPinsOwned([]);
      setPinsSaved([]);
      setReady(false);
    }
  };

  useEffect(() => {
    getProfileData();
    setDisplaySetting('created');
  }, [pathname]);

  useEffect(() => {
    const userObjectIsAvailable = Boolean(Object.keys(loggedInUser).length);
    if (userObjectIsAvailable && !loggedInUser.authenticated) {
      setReady(true);
      setDisplayLogin(true);
    }
  }, [loggedInUser]);

  useLayoutEffect(() => {
    document.body.style.overflowY = 'scroll';
  });

  const pins = displaySetting === 'created' ? pinsOwned : pinsSaved;
  if (!ready) return <Loading />;

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
        marginLeft: 10,
        marginRight: 10,
      }}
      >
        <Typography
          variant="h4"
          color="text.secondary"
        >
          PROFILE
        </Typography>
        <Avatar sx={{
          bgcolor: providerIcons[retrievedUser.service as keyof providerIconsType].color, mt: 3,
        }}
        >
          {providerIcons[retrievedUser.service as keyof providerIconsType].icon}
        </Avatar>
        <Typography variant="h6" sx={{ mt: 3 }}>{retrievedUser.displayName}</Typography>
        <UserPinsSelector
          displaySetting={displaySetting}
          setDisplaySetting={(val: string) => setDisplaySetting(val)}
        />
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
        }}
        >
          <Box sx={{
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: 2,
            padding: 2,
            textAlign: 'center',
          }}
          >
            <Typography
              variant="h6"
              color="text.secondary"
            >
              {`${retrievedUser.displayName} has not ${displaySetting} any pins`}
            </Typography>
          </Box>

          <img
            alt="no-pins-created"
            src={error}
            style={{ width: 200, height: 200 }}
          />
        </div>
      )}

    </>
  );
}
export default Profile;
