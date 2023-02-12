import { Request } from 'express';
import { genericResponseType } from '../interfaces';
import {
  getUserProfile,
} from '../utils';
import pins from '../models/pins';
import { UserType } from '../models/user';
import pinLinks from '../models/pinlinks';

const deletePin = async (req: Request, res: genericResponseType) => {
  const { userId, displayName, isAdmin } = getUserProfile(req.user as UserType);
  const query = { _id: req.params._id };
  const pinID = req.params._id;
  try {
    const pin = await pins.findById(pinID).exec();
    if (!pin) return res.end();
    if (userId === pin.owner.toString() || isAdmin) {
      const removedPin = await pins.findOneAndRemove(query).exec();
      await pinLinks.findOneAndRemove({ pin_id: pinID }).exec();
      console.log(`${displayName} deleted pin ${removedPin && removedPin.imgDescription}`);
      return res.json(removedPin);
    }
    throw new Error(`Pin ID: ${pinID} is not owned by user ID: ${userId} - delete operation cancelled!`);
  } catch (error) {
    return res.json(error);
  }
};

export default deletePin;
