import React from 'react';
import { PinType } from '../../interfaces';
import './imagebuild.scss';

interface HandleThumbnailImageProps {
  pin: PinType
  pinImage: (pin: PinType) => void
  deletePin: ((pin: PinType) => void) | null
}

function HandleThumbnailImage({ pin, pinImage, deletePin }: HandleThumbnailImageProps) {
  /* For the logged in user's profile page */
  if (deletePin) {
    return (
      <button
        type="submit"
        className="actionbutton"
        onClick={() => deletePin(pin)}
      >
        {pin.owns ? 'Delete' : 'Unpin'}
      </button>
    );
  }
  /* For anything other than the logged in user's profile page */
  if (pin.owns) {
    return null;
  }

  if (pin.hasSaved) {
    return (
      <button
        type="submit"
        className="actionbutton"
        onClick={() => pinImage(pin)}
      >
        Unpin
      </button>
    );
  }

  return (
    <button
      type="submit"
      className="actionbutton save"
      onClick={() => pinImage(pin)}
    >
      <i className="fa fa-thumb-tack" aria-hidden="true" />
      {' Save'}
    </button>
  );
}

export default HandleThumbnailImage;
