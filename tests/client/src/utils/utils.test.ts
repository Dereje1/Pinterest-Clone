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
      imgWidth: 367.5,
      imgHeight: 367.5,
      parentWidth: 367.5,
      isNoFit: true,
    });
  });

  test('for larger screens', () => {
    global.innerWidth = 1440;
    global.innerHeight = 1234;
    const ans = getZoomedImageStyle({ naturalWidth: 600, naturalHeight: 600 });
    expect(ans).toEqual({
      imgWidth: 1064,
      imgHeight: 1064,
      parentWidth: 1064,
      isNoFit: false,
    });
  });

  test('for small width images will fix the parent div size', () => {
    global.innerWidth = 550;
    global.innerHeight = 1234;
    const ans = getZoomedImageStyle({ naturalWidth: 350, naturalHeight: 800 });
    expect(ans).toEqual({
      imgWidth: 465.5,
      imgHeight: 1064,
      parentWidth: 500,
      isNoFit: true,
    });
  });

  test('for small inner heights', () => {
    global.innerWidth = 550;
    global.innerHeight = 450;
    const ans = getZoomedImageStyle({ naturalWidth: 350, naturalHeight: 800 });
    expect(ans).toEqual({
      imgWidth: 144.375,
      imgHeight: 330,
      parentWidth: 500,
      isNoFit: true,
    });
  });
});
