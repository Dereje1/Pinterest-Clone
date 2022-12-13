/**
 * @jest-environment jsdom
 */
import { encodeImageFileAsURL, initialDisplayPerScroll } from '../../../../client/src/utils/utils';

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
