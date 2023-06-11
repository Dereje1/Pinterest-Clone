import mongoose from 'mongoose';

interface ImageResponse {
  created: number;
  data: {
    url: string;
  }[];
}

interface Choice {
  text: string;
  index: number;
  logprobs: null;
  finish_reason: string;
}

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface TitleResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
}

interface Response {
  imageResponse: ImageResponse;
  titleResponse: TitleResponse;
}

export interface AIgeneratedType {
  userId: string,
  description: string
  response: Response
}

const AIgeneratedSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  response: { type: Object, required: true },
}, { timestamps: true });

export default mongoose.model<AIgeneratedType>('AIgenerated', AIgeneratedSchema);
