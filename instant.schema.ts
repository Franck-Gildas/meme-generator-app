import { i } from "@instantdb/react";

const schema = i.schema({
  entities: {
    memes: i.entity({
      imageUrl: i.string(),
      baseImageUrl: i.string().optional(),
      textBoxes: i.json(),
      createdAt: i.number().indexed(),
      createdBy: i.string().optional(),
      upvotes: i.number().indexed(),
    }),
    votes: i.entity({
      memeId: i.string().indexed(),
      userId: i.string().indexed(),
      createdAt: i.number().indexed(),
    }),
  },
  rooms: {},
});

export default schema;
