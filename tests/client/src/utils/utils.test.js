import { getCloudFrontLink } from '../../../../client/src/utils/utils';

test('Will get the cloud front link for prod bucket', () => {
  const ans = getCloudFrontLink('https://s3.amazonaws.com/pinterest.clone/a-pin');
  expect(ans).toBe('https://d1ttxrulihk8wq.cloudfront.net/a-pin');
});

test('Will get original link for non-prod bucket', () => {
  const ans = getCloudFrontLink('https://s3.amazonaws.com/pinterest.clone.dev/a-pin');
  expect(ans).toBe('https://s3.amazonaws.com/pinterest.clone.dev/a-pin');
});

test('Will get original link for any split errors', () => {
  const ans = getCloudFrontLink(null);
  expect(ans).toBe(null);
});
