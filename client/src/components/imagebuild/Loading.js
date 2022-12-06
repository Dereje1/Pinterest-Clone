import React from 'react';
import PropTypes from 'prop-types';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';

const Loading = ({ imagesLoaded, ready }) => (
  <div id="loadingcontainer">
    {
      imagesLoaded && ready ? <DownloadDoneIcon />
        : (
          <>
            <div className="bubbles A" />
            <div className="bubbles B" />
            <div className="bubbles C" />
          </>
        )
    }
  </div>
);


export default Loading;

Loading.defaultProps = {
  imagesLoaded: undefined,
  ready: undefined,
};

Loading.propTypes = {
  imagesLoaded: PropTypes.bool,
  ready: PropTypes.bool,
};
