import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getUser } from '../../actions/authentication';
import RESTcall from '../../crud';

function LogOut() {
  const history = useHistory();
  const dispatch = useDispatch();

  const logout = async () => {
    await RESTcall({ address: '/auth/logout' });
    dispatch(getUser('/auth/profile'));
    history.replace('/');
  };

  useEffect(() => {
    logout();
  }, []);

  return null;
}

export default LogOut;
