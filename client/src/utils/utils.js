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
  let newWidth = innerWidth;
  const imageResolultion = imageWidth / imageHeight;
  const screenResolution = innerWidth / innerHeight;
  if (screenResolution > imageResolultion) {
    newWidth = imageWidth * (innerHeight / imageHeight);
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

export const isDuplicateError = (allPinLinks, picPreview) => {
  for (let i = 0; i < allPinLinks.length; i += 1) {
    const { imgLink, originalImgLink, cloudFrontLink } = allPinLinks[i];
    if (
      imgLink === picPreview
      || originalImgLink === picPreview
      || cloudFrontLink === picPreview
    ) return true;
  }
  return false;
};
