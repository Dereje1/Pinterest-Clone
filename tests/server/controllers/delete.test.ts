import deletePin from '../../../server/controllers/delete';
import pins from '../../../server/models/pins'; // schema for pins
import pinLinks from '../../../server/models/pinlinks'; // schema for pins
import {
  user, rawPinsStub,
} from '../stub';
import { genericRequest } from '../interfaces';
import { PopulatedPinType } from '../../../server/interfaces';

/* Mongoose mocks */
const setupMocks = (response: PopulatedPinType[] | unknown = rawPinsStub) => {
  pins.findById = jest.fn().mockImplementation(
    () => ({
      exec: jest.fn().mockResolvedValue(response),
    }),
  );
};

describe('Deleting an image', () => {
  let res;
  let mockedFindOneAndRemove;
  let mockedFindById;
  const req = {
    user,
    params: { _id: '1' },
  };
  beforeEach(() => {
    res = { json: jest.fn(), end: jest.fn() };
    pinLinks.findOneAndRemove = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue([]),
      }),
    );
    mockedFindOneAndRemove = jest.mocked(pinLinks.findOneAndRemove);
  });
  afterEach(() => {
    jest.restoreAllMocks();
    mockedFindOneAndRemove.mockClear();
  });

  test('will delete an image if the user is an owner', async () => {
    pins.findOneAndRemove = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(rawPinsStub[0]),
      }),
    );

    setupMocks({ ...rawPinsStub[0], owner: user._id });
    await deletePin(req as genericRequest, res);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('1');
    expect(pins.findOneAndRemove).toHaveBeenCalledTimes(1);
    expect(pins.findOneAndRemove).toHaveBeenCalledWith({ _id: '1' });
    expect(pinLinks.findOneAndRemove).toHaveBeenCalledWith({ pin_id: '1' });
    expect(res.json).toHaveBeenCalledWith(rawPinsStub[0]);
  });

  test('will throw an error if user is not an owner', async () => {
    const updatedReq = { ...req, params: { _id: '2' } };
    setupMocks(rawPinsStub[1]);
    await deletePin(updatedReq as genericRequest, res);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('2');
    expect(res.json).toHaveBeenCalledWith(Error('Pin ID: 2 is not owned by user ID: 5cad310f7672ca00146485a8 - delete operation cancelled!'));
  });

  test('will delete any image if the user is an admin', async () => {
    const updatedReq = { ...req, params: { _id: '2' } };
    process.env = {
      ...process.env,
      ADMIN_USER_ID: 'twitter test id',
    };
    pins.findOneAndRemove = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(rawPinsStub[1]),
      }),
    );

    setupMocks(rawPinsStub[1]);
    await deletePin(updatedReq as genericRequest, res);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('2');
    expect(pins.findOneAndRemove).toHaveBeenCalledTimes(1);
    expect(pins.findOneAndRemove).toHaveBeenCalledWith({ _id: '2' });
    expect(res.json).toHaveBeenCalledWith(rawPinsStub[1]);
  });

  test('will end response if pin not found in db', async () => {
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(null),
      }),
    );
    mockedFindById = jest.mocked(pins.findById);

    pins.findOneAndRemove = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(rawPinsStub[0]),
      }),
    );
    await deletePin(req as genericRequest, res);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('1');
    expect(pins.findOneAndRemove).toHaveBeenCalledTimes(0);
    expect(res.json).not.toHaveBeenCalled();
    expect(res.end).toHaveBeenCalledTimes(1);
    mockedFindById.mockClear();
  });

  test('will respond with error if DELETE is rejected', async () => {
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await deletePin(req as genericRequest, res);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});
