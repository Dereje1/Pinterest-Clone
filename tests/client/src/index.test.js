/**
 * @jest-environment jsdom
 */
import ReactDOM from 'react-dom';
// eslint-disable-next-line no-unused-vars
import index from '../../../client/src/index';

jest.mock('../../../client/src/crud');
jest.mock('react-dom', () => ({ render: jest.fn() }));

test('will render without crashing', () => {
  const div = document.createElement('div');
  div.id = 'app';
  document.body.appendChild(div);
  expect(ReactDOM.render).toHaveBeenCalled();
});
