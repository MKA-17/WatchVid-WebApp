import { create } from "zustand";

export const useHelmet = create((set) => ({
  helmet: {
    author: 'MKA-17',
    title: 'WatchVid',
    description: `WatchVid - Your go-to platform for engaging and entertaining videos. Explore a wide range of content, including tutorials, reviews, and much more.`,
    keywords: 'watchVid, video platform, entertainment, tutorials, reviews',
},
  setHelmet: (value) =>
    set((state) => ({
      helmet: typeof value === "function" ? value(state.helmet) : value,
    })),
 
}));

