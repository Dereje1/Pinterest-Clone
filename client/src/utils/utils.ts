import { PinType, tagType } from '../interfaces';

export const shuffleImages = (arr: PinType[]) => {
  const shuffled: PinType[] = [];
  while (arr.length) {
    const randIndex = Math.floor(Math.random() * arr.length);
    const [removed] = arr.splice(randIndex, 1);
    shuffled.push(removed);
  }
  return shuffled;
};

const searchInTags = (tags:tagType[], search: string) => {
  for (let i = 0; i < tags.length; i += 1) {
    if (tags[i].tag.toLowerCase().includes(search)) {
      return true;
    }
  }
  return false;
};

export const getFilteredPins = (pinList: PinType[], search: string | null) => {
  if (!search) return pinList;
  const filteredPins = pinList.filter(({ owner, imgDescription, tags }) => {
    const isFoundInDescription = imgDescription.toLowerCase().includes(search);
    const isFoundInOwnerName = owner.name.toLowerCase().includes(search);
    const isFoundInTags = searchInTags(tags, search);
    return isFoundInDescription || isFoundInOwnerName || isFoundInTags;
  });
  return filteredPins;
};

export const getZoomedImageStyle = ({
  naturalWidth: imageWidth,
  naturalHeight: imageHeight,
}:{naturalWidth: number, naturalHeight: number}) => {
  // dynamically resize image
  let { innerWidth, innerHeight } = window;
  // parameter for innerwidth/height adjustment with mobile consideration
  // top(70) + headingheight(50 / 25) + button height (50 / 25)
  innerHeight = innerHeight < 500 ? innerHeight - 120 : innerHeight - 170;
  // minor x direction adjustment for padding too
  innerWidth -= (innerWidth * 0.02);
  let isNoFit = false;
  const ratio = Math.min(innerWidth / imageWidth, innerHeight / imageHeight);
  const newWidth = imageWidth * ratio;
  let parentWidth = newWidth;
  if (newWidth < 500) {
    if (innerWidth < 500) {
      parentWidth = innerWidth;
    } else {
      parentWidth = 500;
    }
    isNoFit = true;
  }
  return {
    imgWidth: `${newWidth}px`,
    parentWidth,
    isNoFit,
  };
};

export const getFormattedDescription = (imgDescription: string) => (imgDescription.length > 15 ? `${imgDescription.slice(0, 15)}...` : imgDescription);

// eslint-disable-next-line no-promise-executor-return
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const validateURL = (string: string) => {
  try {
    const url = new URL(string);
    if (url.protocol === 'data:' || url.protocol === 'https:') return string;
    if (url.protocol === 'http:') {
      // convert to https to avoid mixed content warning in console
      return `${string.split(':')[0]}s:${string.split(':')[1]}`;
    }
  } catch (_) {
    return null;
  }
  return null;
};

export const getModalWidth = () => {
  const { innerWidth } = window;
  if (innerWidth < 500) {
    return innerWidth;
  } if (innerWidth > 1000) {
    return innerWidth / 3;
  }
  return innerWidth / 2;
};

export const encodeImageFileAsURL = (imgFile: File):Promise<string|ArrayBuffer|null> => new Promise(
  (resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(imgFile);
  },
);

export const initialDisplayPerScroll = () => (window.innerWidth > 1440 ? 20 : 10);

export const formatDate = (date: string) => {
  const [, day, mth, year] = new Date(date).toUTCString().split(' ');
  return `${day} ${mth} ${year}`;
};
// only good for a single populated pin
export const updatePinList = (oldList: PinType[], newPin: PinType) => {
  const indexOfUpdate = oldList.findIndex((p) => p._id === newPin._id);
  return [
    ...oldList.slice(0, indexOfUpdate),
    newPin,
    ...oldList.slice(indexOfUpdate + 1),
  ];
};

// used for on the fly change of display name in my pins page
export const onTheFlyPinListNameChange = (
  pinList: PinType[],
  newName: string,
  oldDisplayName: string | null,
) => pinList.map((pin) => {
  if (pin.owns) {
    return {
      ...pin,
      owner: {
        ...pin.owner,
        name: newName,
      },
    };
  }
  const newSavedBy = pin.savedBy.map(
    (pinner) => (pinner.name === oldDisplayName
      ? { ...pinner, name: newName }
      : pinner
    ),
  );
  return {
    ...pin,
    savedBy: newSavedBy,
  };
});
