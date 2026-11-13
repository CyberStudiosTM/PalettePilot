interface Window {
  palettePilotDesktop?: {
    savePalette: (name: string, text: string) => Promise<boolean>;
  };
}
