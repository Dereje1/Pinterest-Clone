import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ImageBuild from '../imagebuild/Imagebuild';
import RESTcall from '../../crud';


const Profile = () => {
  const [userPinsOwned, setUserPinsOwned] = useState([]);
  const [userPinsSaved, setUserPinsSaved] = useState([]);
  const [ready, setReady] = useState(false);

  const { userid } = useParams();
  const user = useSelector(state => state.user);

  useEffect(() => {
    const getProfileData = async () => {
      const data = await RESTcall({ address: `/api/userProfile/${userid}` });
      setUserPinsOwned(data.filter(d => d.owns));
      setUserPinsSaved(data.filter(d => d.hasSaved));
      setReady(true);
    };
    getProfileData();
  }, []);

  return (
    [userPinsOwned, userPinsSaved].map((pins, idx) => (
      <>
        { pins.length && (
          <>
            <h1 style={{ marginTop: 100 }}>{idx === 0 ? 'owns' : 'saved'}</h1>
            <ImageBuild
              pinImage={null}
              deletePin={null}
              pinList={pins}
              ready={ready}
              user={user}
            />
          </>
        )}
      </>
    ))

  );
};
export default Profile;
