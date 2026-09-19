"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              shape?: "rectangular" | "pill" | "circle" | "square";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
}

export function GoogleSignInButton({ onCredential, text = "continue_with" }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);

  // Cobre navegação client-side entre login/registro: o script pode já
  // estar carregado no <head> de uma visita anterior, e o onLoad do
  // <Script> não dispara de novo nesse caso; checamos o global direto.
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setIsScriptReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isScriptReady || !buttonRef.current || !window.google || !GOOGLE_CLIENT_ID) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => onCredential(response.credential),
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text,
      width: 320,
    });
  }, [isScriptReady, onCredential, text]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setIsScriptReady(true)}
      />
      <div ref={buttonRef} className="flex justify-center" />
    </>
  );
}
