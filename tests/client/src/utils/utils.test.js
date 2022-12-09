/**
 * @jest-environment jsdom
 */
import { encodeImageFileAsURL } from '../../../../client/src/utils/utils';

test('will handle succesful encoding', async () => {
  const file = new File([], 'file.jpg');
  const ans = await encodeImageFileAsURL(file);
  expect(ans).toBe('data:application/octet-stream;base64,');
});
