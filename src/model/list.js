'use strict';

import mongoose from 'mongoose';
import Profile from './profile';

const listSchema = mongoose.Schema({
  title: { 
    type: String, 
    required: true,
  },
  details: { 
    type: String, 
  },
  profile: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'tasks',
    },
  ],
});

function savePreHook(done) {
  return Profile.findById(this.profile)
    .then((profileFound) => {
      if (profileFound.lists.indexOf(this._id) < 0) {
        profileFound.lists.push(this._id);
      }
      return profileFound.save();
    })
    .then(() => {
      return done();
    })
    .catch(done);
}

function removeEventHook(document, next) {
  Profile.findById(document.profile)
    .then((profileFound) => {
      profileFound.events = profileFound.events.filter((event) => {
        return event._id.toString() !== document._id.toString();
      });
      return profileFound.save();
    })
    .then(() => next())
    .catch(next);
}

listSchema.pre('save', savePreHook);
listSchema.post('remove', removeEventHook);

export default mongoose.model('list', listSchema);
