import React from 'react';
import PropTypes from 'prop-types';

const Loading = ({ imagesLoaded, ready }) => (
  <div id="bubblecontainer" style={{ display: imagesLoaded && ready ? 'none' : 'flex' }}>
    <div className="bubbles A" />
    <div className="bubbles B" />
    <div className="bubbles C" />
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
