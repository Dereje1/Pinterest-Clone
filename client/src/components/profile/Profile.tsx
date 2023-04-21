import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import ImageBuild from '../imagebuild/Imagebuild';
import {
  Loading, getProviderIcons, UserPinsSelector, UserJoinedDate,
} from '../common/common';
import SearchUsers from './SearchUsers';
import RESTcall from '../../crud';
import { providerIconsType, userType } from '../../interfaces';
import error from '../../assets/error.png';

const providerIcons = getProviderIcons({ fontSize: 30 });

function Profile() {
  const [pinsOwned, setPinsOwned] = useState([]);
  const [pinsSaved, setPinsSaved] = useState([]);
  const [ready, setReady] = useState(false);
  const [displaySetting, setDisplaySetting] = useState('created');
  const [retrievedUser, setRetrievedUser] = useState({ service: 'twitter', displayName: '', joined: '' });
  const [displaySearch, setDisplaySearch] = useState(false);

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
    if (loggedInUser.authenticated) {
      getProfileData();
      setDisplaySetting('created');
    }
  }, [pathname, loggedInUser.authenticated]);

  useEffect(() => {
    const userObjectIsAvailable = Boolean(Object.keys(loggedInUser).length);
    if (userObjectIsAvailable && !loggedInUser.authenticated) {
      history.push('/');
    }
  }, [loggedInUser]);

  useLayoutEffect(() => {
    document.body.style.overflowY = 'scroll';
  });

  const pins = displaySetting === 'created' ? pinsOwned : pinsSaved;
  if (!ready) return <Loading />;

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
        <div style={{
          display: 'flex', alignItems: 'center', height: 100, marginBottom: 0,
        }}
        >
          {
            displaySearch
              ? (
                <SearchUsers
                  closeSearch={() => setDisplaySearch(false)}
                  authenticated={loggedInUser.authenticated}
                />
              )
              : (
                <>
                  <Typography
                    variant="h4"
                    color="text.secondary"
                  >
                    PROFILE
                  </Typography>
                  <IconButton onClick={() => setDisplaySearch(true)} sx={{ ml: 2 }}>
                    <SearchIcon
                      fontSize="large"
                    />
                  </IconButton>
                </>
              )
          }
        </div>
        <Avatar sx={{
          bgcolor: providerIcons[retrievedUser.service as keyof providerIconsType].color, mt: 0,
        }}
        >
          {providerIcons[retrievedUser.service as keyof providerIconsType].icon}
        </Avatar>
        <Typography variant="h6" sx={{ mt: 3 }}>{retrievedUser.displayName}</Typography>
        <UserJoinedDate dateJoined={retrievedUser.joined} />
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
