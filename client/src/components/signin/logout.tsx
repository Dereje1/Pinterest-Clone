import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getUser } from '../../actions/authentication';
import RESTcall from '../../crud';

function LogOut() {
  const history = useHistory();
  const dispatch = useDispatch();

  const logout = async () => {
    // TODO: vite erroring out on axios rest call to auth/logout
    // await RESTcall({ address: '/auth/logout' });
    // dispatch(getUser('/auth/profile'));
    // history.replace('/logout');
    window.location.assign('/auth/logout');
  };

  useEffect(() => {
    logout();
  }, []);

  return null;
}

export default LogOut;
