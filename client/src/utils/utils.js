export const shuffleImages = (arr) => {
  const shuffled = [];
  while (arr.length) {
    const randIndex = Math.floor(Math.random() * arr.length);
    const [removed] = arr.splice(randIndex, 1);
    shuffled.push(removed);
  }
  return shuffled;
};

const searchInTags = (tags, search) => {
  for (let i = 0; i < tags.length; i += 1) {
    if (tags[i].tag.toLowerCase().includes(search)) {
      return true;
    }
  }
  return false;
};

export const getFilteredPins = (pinList, search) => {
  if (!search) return pinList;
  const filteredPins = pinList.filter(({ owner, imgDescription, tags }) => {
    const isFoundInDescription = imgDescription.toLowerCase().includes(search);
    const isFoundInOwnerName = owner.name.toLowerCase().includes(search);
    const isFoundInTags = searchInTags(tags, search);
    return isFoundInDescription || isFoundInOwnerName || isFoundInTags;
  });
  return filteredPins;
};

export const getNewImageWidth = ({
  naturalWidth: imageWidth,
  naturalHeight: imageHeight,
}) => {
  // dynamically resize image
  let { innerWidth, innerHeight } = window;
  // parameter for innerwidth/height adjustment with mobile consideration
  // top(70) + headingheight(50 / 25) + button height (50 / 25)
  innerHeight = innerHeight < 500 ? innerHeight - 120 : innerHeight - 170;
  // minor x direction adjustment for padding too
  innerWidth -= (innerWidth * 0.02);
  let newWidth = innerWidth;
  let isNoFit = false;
  const imageResolultion = imageWidth / imageHeight;
  const screenResolution = innerWidth / innerHeight;
  if (screenResolution > imageResolultion) {
    newWidth = imageWidth * (innerHeight / imageHeight);
  }

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
    titleSize: `${newWidth < 500 ? 1.2 : 2}em`,
    subTitleSize: `${newWidth < 500 ? 0.9 : 1.2}em`,
    dateSize: `${newWidth < 500 ? 0.45 : 0.6}em`,
    pinnersSize: '2em',
    isNoFit,
  };
};

export const getPinners = (savedBy) => (savedBy.length > 3
  ? `${savedBy.slice(0, 3).join(', ')} and ${savedBy.length - 3} others`
  : `${savedBy.join(', ')}`);

export const getFormattedDescription = (imgDescription) => (imgDescription.length > 15 ? `${imgDescription.slice(0, 15)}...` : imgDescription);

// eslint-disable-next-line no-promise-executor-return
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

export const encodeImageFileAsURL = (imgFile) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    resolve(reader.result);
  };
  reader.onerror = (err) => {
    reject(err);
  };
  reader.readAsDataURL(imgFile);
});

export const initialDisplayPerScroll = () => (window.innerWidth > 1440 ? 20 : 10);

export const formatDate = (date) => {
  const [, day, mth, year] = new Date(date).toUTCString().split(' ');
  return `${day} ${mth} ${year}`;
};

export const updatePinList = (oldList, newPin) => {
  const indexOfUpdate = oldList.findIndex((p) => p._id === newPin._id);
  return [
    ...oldList.slice(0, indexOfUpdate),
    newPin,
    ...oldList.slice(indexOfUpdate + 1),
  ];
};
