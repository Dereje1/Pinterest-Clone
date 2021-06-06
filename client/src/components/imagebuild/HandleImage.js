import React from 'react';
import PropTypes from 'prop-types';
import './imagebuild.scss';

const HandleImage = ({ element, pinImage, deletePin }) => {
  if (!pinImage) {
    return (
      <button
        type="submit"
        className="actionbutton"
        onClick={() => deletePin(element)}
      >
        Delete
      </button>
    );
  }
  // finds the status of image to determine what kind of button to place on pic
  if (element.hasSaved || element.owns) { // If the user has already saved this pin
    return null; // no button
  }
  // user has not saved this pin show save button
  return (
    <button
      type="submit"
      className="actionbutton save"
      onClick={() => pinImage(element)}
    >
      <i className="fa fa-thumb-tack" aria-hidden="true" />
      {' Save'}
    </button>
  );
};

export default HandleImage;

HandleImage.defaultProps = {
  pinImage: null,
  deletePin: null,
};

HandleImage.propTypes = {
  element: PropTypes.objectOf(PropTypes.any).isRequired,
  // what type of button to place on pic/thumbnail executed by caller
  pinImage: PropTypes.func,
  deletePin: PropTypes.func,
};
