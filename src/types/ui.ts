import type { Doc } from "../../convex/_generated/dataModel";

export type SimulationMode = Doc<"worlds">["mode"];

export type ToolTestStep = {
  characterId: string;
  toolName: string;
  task: string;
  message?: string;
};

export type ToolTestStatus = {
  tone: "idle" | "running" | "success" | "error";
  text: string;
};

export type SidebarTab = "assets" | "logs" | "tools" | "chat";
