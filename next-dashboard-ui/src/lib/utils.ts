import ImageKit from "imagekit"

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}