import type { InstantRules } from "@instantdb/react";

const rules: InstantRules = {
  memes: {
    allow: {
      view: "true",
      create:
        "auth.id != null && (auth.id == data.createdBy || auth.email == data.createdBy)",
      update:
        "auth.id != null && (auth.id == data.createdBy || auth.email == data.createdBy)",
      delete:
        "auth.id != null && (auth.id == data.createdBy || auth.email == data.createdBy)",
    },
  },
  votes: {
    allow: {
      view: "true",
      create:
        "auth.id != null && (auth.id == data.userId || auth.email == data.userId)",
      update: "false",
      delete:
        "auth.id != null && (auth.id == data.userId || auth.email == data.userId)",
    },
  },
};

export default rules;
