'use strict';

import mongoose from 'mongoose';
import Profile from './profile';

const taskSchema = mongoose.Schema({
  title: { 
    type: String, 
    required: true,
  },
  details: { 
    type: String, 
    required: true,
  },
  profile: {
    type: mongoose.Schema.ObjectId,
    required: true,
    unique: true,
  },
  subtasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'subtask',
    },
  ],
});

function savePreHook(done) {
  return Profile.findById(this.profile)
    .then((profileFound) => {
      if (profileFound.tasks.indexOf(this._id) < 0) {
        profileFound.tasks.push(this._id);
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

taskSchema.pre('save', savePreHook);
taskSchema.post('remove', removeEventHook);

export default mongoose.model('task', taskSchema);
