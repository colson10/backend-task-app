'use strict';

import mongoose from 'mongoose';
import Profile from './profile';
import List from './list';

const listSchema = mongoose.Schema({
  title: { 
    type: String, 
    required: true,
  },
  details: { 
    type: String, 
  },
  time: {
    type: Number,
    default: 30,
  },
  done: {
    type: Boolean,
    default: false,
  },
  profile: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  list: {
    type: mongoose.Schema.ObjectId,
    required: true,
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
      return profileFound.save()
        .then(() => {
          List.findById(this.list)
            .then((listFound) => {
              if (listFound.tasks.indexOf(this._id) < 0) {
                listFound.tasks.push(this._id);
              }
              return listFound.save();
            });
        });
    })
    .then(() => {
      return done();
    })
    .catch(done);
}

listSchema.pre('save', savePreHook);

export default mongoose.model('task', listSchema);
