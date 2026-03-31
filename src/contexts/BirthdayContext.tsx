import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

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
  const [data, setDataState] = useState<BirthdayData | null>(null);
  const [shareUrl, setShareUrlState] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedData = window.sessionStorage.getItem("wishblow:birthday-data");
    const savedShareUrl = window.sessionStorage.getItem("wishblow:share-url");

    if (savedData) {
      try {
        setDataState(JSON.parse(savedData));
      } catch {
        window.sessionStorage.removeItem("wishblow:birthday-data");
      }
    }

    if (savedShareUrl) {
      setShareUrlState(savedShareUrl);
    }
  }, []);

  const setData = (nextData: BirthdayData) => {
    setDataState(nextData);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("wishblow:birthday-data", JSON.stringify(nextData));
    }
  };

  const setShareUrl = (url: string) => {
    setShareUrlState(url);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("wishblow:share-url", url);
    }
  };

  return (
    <BirthdayContext.Provider value={{ data, setData, shareUrl, setShareUrl }}>
      {children}
    </BirthdayContext.Provider>
  );
};
