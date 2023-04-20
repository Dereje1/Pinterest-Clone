import { useEffect } from 'react';

function LogOut() {
  const logout = async () => {
    window.location.assign('/auth/logout');
  };

  useEffect(() => {
    logout();
  }, []);

  return null;
}

export default LogOut;
