import React, { createContext, useContext, useState, ReactNode } from "react";

export interface BirthdayData {
  name: string;
  age: number;
  message: string;
  senderName: string;
  relationshipTag: string;
  photoUrl: string | null;
  memoryPhotos: string[];
  wishText: string;
  audioUrl: string | null;
  bgmUrl: string | null;
}

interface BirthdayContextType {
  data: BirthdayData | null;
  setData: (data: BirthdayData) => void;
  shareUrl: string | null;
  setShareUrl: (url: string) => void;
}

const BirthdayContext = createContext<BirthdayContextType>({
  data: null,
  setData: () => {},
  shareUrl: null,
  setShareUrl: () => {},
});

export const useBirthday = () => useContext(BirthdayContext);

export const BirthdayProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<BirthdayData | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  return (
    <BirthdayContext.Provider value={{ data, setData, shareUrl, setShareUrl }}>
      {children}
    </BirthdayContext.Provider>
  );
};
