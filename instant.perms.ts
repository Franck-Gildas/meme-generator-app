import type { InstantRules } from '@instantdb/react';

const rules: InstantRules = {
  memes: {
    allow: {
      view: true,
      create: true,
      update: false,
      delete: false,
    },
  },
  votes: {
    allow: {
      view: true,
      create: true,
      update: false,
      delete: false,
    },
  },
};

export default rules;
