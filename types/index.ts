export interface TextBox {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  width: number;
  height: number;
}

export interface Meme {
  id: string;
  imageUrl: string;
  baseImageUrl?: string;
  textBoxes: string;
  createdAt: number;
  createdBy?: string;
  upvotes: number;
}

export interface Vote {
  id: string;
  memeId: string;
  userId: string;
  createdAt: number;
}
