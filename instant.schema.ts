import { i } from '@instantdb/react';

const schema = i.schema({
  entities: {
    memes: i.entity({
      imageUrl: i.string(),
      textBoxes: i.json(),
      createdAt: i.number(),
      createdBy: i.string().optional(),
      upvotes: i.number(),
    }),
    votes: i.entity({
      memeId: i.string(),
      userId: i.string(),
      createdAt: i.number(),
    }),
  },
  rooms: {},
});

export default schema;
