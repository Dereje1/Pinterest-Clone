import { Router } from 'express';
import isLoggedIn from './auth/isloggedin';
// controllers
import addPin from './controllers/post';
import {
  getPins, getProfilePins, getTags, getUserPins,
} from './controllers/get';
import {
  addComment, pinImage, unpin, updateTags, updateDisplayName, getDuplicateError,
} from './controllers/put';
import deletePin from './controllers/delete';

const router = Router();
// adds a new pin to the db
router.post('/api/newpin', isLoggedIn, addPin);

// gets all pins for home page
router.get('/api/home', getPins);

// gets pins for mypins page
router.get('/api/mypins', isLoggedIn, getUserPins);

// gets pins for a single user
router.get('/api/userProfile/:userid', isLoggedIn, getProfilePins);

// gets all used tags
router.get('/api/getTags', isLoggedIn, getTags);

// Adds a user to a pin's savedby list
router.put('/api/pin/:_id', isLoggedIn, pinImage);

// Removes user from a pin's savedby list
router.put('/api/unpin/:_id', isLoggedIn, unpin);

// Adds a comment to a pin
router.put('/api/comment/:_id', isLoggedIn, addComment);

// Adds/removes a tag from a pin
router.put('/api/updateTags/', isLoggedIn, updateTags);

// Update display name
router.put('/api/updateDisplayName/', isLoggedIn, updateDisplayName);

// validates for duplicate errors on new pins
router.put('/api/getDuplicateError/', isLoggedIn, getDuplicateError);

// deletes a pin if owned by user
router.delete('/api/:_id', isLoggedIn, deletePin);

export default router;
