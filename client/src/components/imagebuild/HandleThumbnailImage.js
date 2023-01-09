import React from 'react';
import PropTypes from 'prop-types';
import './imagebuild.scss';

function HandleThumbnailImage({ element, pinImage, deletePin }) {
  /* For the logged in user's profile page */
  if (!pinImage) {
    return (
      <button
        type="submit"
        className="actionbutton"
        onClick={() => deletePin(element)}
      >
        {element.owns ? 'Delete' : 'Unpin'}
      </button>
    );
  }
  /* For anything other than the logged in user's profile page */
  if (element.owns) {
    return null;
  }

  if (element.hasSaved) {
    return (
      <button
        type="submit"
        className="actionbutton"
        onClick={() => pinImage(element)}
      >
        Unpin
      </button>
    );
  }

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
}

export default HandleThumbnailImage;

HandleThumbnailImage.defaultProps = {
  pinImage: null,
  deletePin: null,
};

HandleThumbnailImage.propTypes = {
  element: PropTypes.objectOf(PropTypes.shape).isRequired,
  // what type of button to place on pic/thumbnail executed by caller
  pinImage: PropTypes.func,
  deletePin: PropTypes.func,
};
