"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { gameConfig } from "./config/phaser-config";

export default function Game() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game(gameConfig);
    }

    useEffect(() => {
      console.log(document.getElementById("game-container"));

      if (!gameRef.current) {
        gameRef.current = new Phaser.Game(gameConfig);
      }

      return () => {
        gameRef.current?.destroy(true);
      };
    }, []);

    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  return <div id="game-container" />;
}