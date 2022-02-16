export const shuffleImages = (arr) => {
  const shuffled = [];
  while (arr.length) {
    const randIndex = Math.floor(Math.random() * arr.length);
    const [removed] = arr.splice(randIndex, 1);
    shuffled.push(removed);
  }
  return shuffled;
};

export const getFilteredPins = (pinList, search) => {
  if (!search) return pinList;
  const filteredPins = pinList.filter(({ owner, imgDescription }) => {
    const isFoundInDescription = imgDescription.toLowerCase().includes(search);
    const isFoundInOwnerName = owner.toLowerCase().includes(search);
    return isFoundInDescription || isFoundInOwnerName;
  });
  return filteredPins;
};

export const getNewImageWidth = ({
  naturalWidth: imageWidth,
  naturalHeight: imageHeight,
  parentDivStyle,
}) => {
  // dynamically resize image
  let { innerWidth, innerHeight } = window;
  // parameter for innerwidth/height adjustment with mobile consideration
  // top(70) + headingheight(50 / 25) + button height (50 / 25)
  innerHeight = innerHeight < 500 ? innerHeight - 120 : innerHeight - 170;
  // minor x direction adjustment for padding too
  innerWidth -= (innerWidth * 0.02);
  const aspectRatio = imageWidth / imageHeight;
  let newWidth;
  if (imageWidth < innerWidth && imageHeight < innerHeight) {
    // already fits, return value if above 500 or else
    // expand to 500
    if (imageWidth < 500) {
      newWidth = innerWidth > 500 ? 500 : innerWidth;
    } else {
      newWidth = imageWidth;
    }
  } else if (imageWidth > innerWidth) {
    // test new height with Aspect ratio
    const newHeight = innerWidth / aspectRatio;
    // test again if new height is less than screen height
    if (newHeight > innerHeight) {
      newWidth = aspectRatio * innerHeight;
    } else {
      newWidth = innerWidth;
    }
  } else { // means height > innerheight
    newWidth = aspectRatio * innerHeight;
  }
  return {
    ...parentDivStyle,
    width: `${newWidth}px`,
    small: newWidth < 350,
    titleSize: `${newWidth < 500 ? 1.2 : 2}em`,
    subTitleSize: `${newWidth < 500 ? 0.9 : 1.2}em`,
    dateSize: `${newWidth < 500 ? 0.45 : 0.6}em`,
    pinnersSize: '3em',
  };
};

export const getPinners = savedBy => (savedBy.length > 3
  ? `${savedBy.slice(0, 3).join(', ')} and ${savedBy.length - 3} others`
  : `${savedBy.join(', ')}`);

export const getFormattedDescription = imgDescription => (imgDescription.length > 15 ? `${imgDescription.slice(0, 15)}...` : imgDescription);

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const validateURL = (string) => {
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
