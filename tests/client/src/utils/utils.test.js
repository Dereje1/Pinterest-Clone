/**
 * @jest-environment jsdom
 */
import { encodeImageFileAsURL, initialDisplayPerScroll, getZoomedImageStyle } from '../../../../client/src/utils/utils';

test('will handle succesful encoding', async () => {
  const file = new File([], 'file.jpg');
  const ans = await encodeImageFileAsURL(file);
  expect(ans).toBe('data:application/octet-stream;base64,');
});

test('will change initial pins displayed for monitors larger than laptop', () => {
  global.innerWidth = 1440;
  expect(initialDisplayPerScroll()).toBe(10);
  global.innerWidth = 2560;
  expect(initialDisplayPerScroll()).toBe(20);
});

describe('getting the zoomed image styling properties', () => {
  test('for smaller screens', () => {
    global.innerWidth = 375;
    global.innerHeight = 667;
    const ans = getZoomedImageStyle({ naturalWidth: 600, naturalHeight: 600 });
    expect(ans).toEqual({
      imgWidth: '367.5px',
      parentWidth: 367.5,
      titleSize: '1.2em',
      subTitleSize: '0.9em',
      dateSize: '0.45em',
      pinnersSize: '2em',
      isNoFit: true,
    });
  });

  test('for larger screens', () => {
    global.innerWidth = 1440;
    global.innerHeight = 1234;
    const ans = getZoomedImageStyle({ naturalWidth: 600, naturalHeight: 600 });
    expect(ans).toEqual({
      imgWidth: '1064px',
      parentWidth: 1064,
      titleSize: '2em',
      subTitleSize: '1.2em',
      dateSize: '0.6em',
      pinnersSize: '2em',
      isNoFit: false,
    });
  });

  test('for small width images will fix the parent div size', () => {
    global.innerWidth = 550;
    global.innerHeight = 1234;
    const ans = getZoomedImageStyle({ naturalWidth: 350, naturalHeight: 800 });
    expect(ans).toEqual({
      imgWidth: '465.5px',
      parentWidth: 500,
      titleSize: '1.2em',
      subTitleSize: '0.9em',
      dateSize: '0.45em',
      pinnersSize: '2em',
      isNoFit: true,
    });
  });

  test('for small inner heights', () => {
    global.innerWidth = 550;
    global.innerHeight = 450;
    const ans = getZoomedImageStyle({ naturalWidth: 350, naturalHeight: 800 });
    expect(ans).toEqual({
      imgWidth: '144.375px',
      parentWidth: 500,
      titleSize: '1.2em',
      subTitleSize: '0.9em',
      dateSize: '0.45em',
      pinnersSize: '2em',
      isNoFit: true,
    });
  });
});
