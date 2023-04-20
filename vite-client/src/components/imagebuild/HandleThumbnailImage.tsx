import React from 'react';
import { PinType } from '../../interfaces';
import './imagebuild.scss';

interface HandleThumbnailImageProps {
  element: PinType
  pinImage: (pin: PinType) => void
  deletePin: ((pin: PinType) => void) | null
}

function HandleThumbnailImage({ element, pinImage, deletePin }: HandleThumbnailImageProps) {
  /* For the logged in user's profile page */
  if (deletePin) {
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
