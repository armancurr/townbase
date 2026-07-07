import { AgentLogPanel } from "../panels/agent-log-panel";
import { AssetsStore } from "../panels/assets-store";
import { ChatPanel } from "../panels/chat-panel";
import { MetadataPanel } from "../panels/metadata-panel";
import { ModePanel } from "../panels/mode-panel";
import { ToolTestPanel } from "../panels/tool-test-panel";
import type { Doc } from "../../../convex/_generated/dataModel";
import type {
  PlaceKind,
  PlaceableAsset,
  SidebarTab,
  SimulationMode,
  ToolTestStatus,
  ToolTestStep,
} from "../../types";
import type { ReactNode } from "react";

type SidebarProps = {
  activeTab: SidebarTab;
  onActiveTabChange: (tab: SidebarTab) => void;
  assets: PlaceableAsset[];
  selectedAssetId: string;
  onSelectAsset: (assetId: string) => void;
  selectedTile: Doc<"tiles"> | undefined;
  actions: Doc<"agentActions">[];
  characters: Doc<"characters">[];
  places: Doc<"places">[];
  messages: Doc<"chatMessages">[];
  toolTestPlan: ToolTestStep[];
  toolTestStepIndex: number;
  toolTestStatus: ToolTestStatus;
  isRunning: boolean;
  mode: SimulationMode;
  onSetMode: (mode: SimulationMode) => void;
  onRunPopulationStep: () => void;
  onRunToolTestStep: () => void;
  onResetToolTest: () => void;
  onSaveTileMetadata: (
    stableId: string,
    label: string,
    placeKind: PlaceKind,
    ownerCharacterId: string | null,
  ) => void;
};

const tabs: Array<{ id: SidebarTab; label: string; icon: ReactNode }> = [
  {
    id: "assets",
    label: "Assets",
    icon: (
      <path d="M40 56a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16v48a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16Zm96 0a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16v48a16 16 0 0 1-16 16h-48a16 16 0 0 1-16-16ZM40 152a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16v48a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16Zm96 0a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16v48a16 16 0 0 1-16 16h-48a16 16 0 0 1-16-16Z" />
    ),
  },
  {
    id: "logs",
    label: "Agent logs",
    icon: <path d="M48 56h160v16H48Zm0 48h160v16H48Zm0 48h96v16H48Zm120 0h40v16h-40Zm-120 48h128v16H48Z" />,
  },
  {
    id: "tools",
    label: "Tool tests",
    icon: <path d="M96 40h64v24H96Zm-24 40h112v24H72Zm-24 40h160v88a8 8 0 0 1-8 8H56a8 8 0 0 1-8-8Zm32 32v16h96v-16Zm0 32v16h64v-16Z" />,
  },
  {
    id: "chat",
    label: "Chat",
    icon: <path d="M40 56a24 24 0 0 1 24-24h128a24 24 0 0 1 24 24v88a24 24 0 0 1-24 24h-64l-56 48v-48h-8a24 24 0 0 1-24-24Zm40 32v16h96V88Zm0 40v16h64v-16Z" />,
  },
];

export function Sidebar({
  activeTab,
  onActiveTabChange,
  assets,
  selectedAssetId,
  onSelectAsset,
  selectedTile,
  actions,
  characters,
  places,
  messages,
  toolTestPlan,
  toolTestStepIndex,
  toolTestStatus,
  isRunning,
  mode,
  onSetMode,
  onRunPopulationStep,
  onRunToolTestStep,
  onResetToolTest,
  onSaveTileMetadata,
}: SidebarProps) {
  return (
    <aside className="absolute left-3 top-3 z-[4] flex h-[calc(100%-24px)] w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden rounded-lg border border-[#0b1720]/55 bg-[#101820]/86 text-[#eef4ea] shadow-[0_18px_54px_rgba(5,12,16,0.28)] backdrop-blur" aria-label="Townbase sidebar">
      <div className="flex items-center gap-3 border-b border-[#273338] px-3 py-3">
        <span className="font-['Bytesized'] text-2xl leading-none text-[#d9e4cd] select-none">
          townbase
        </span>
        <nav className="ml-auto flex items-center gap-1" aria-label="Sidebar sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onActiveTabChange(tab.id)}
              className={`grid h-8 w-8 place-items-center rounded-md transition ${
                activeTab === tab.id
                  ? "bg-[#d9e4cd] text-[#17201d]"
                  : "bg-[#17201d]/80 text-[#cdd8c4] hover:bg-[#273338] hover:text-[#f7fbf2]"
              }`}
              aria-label={tab.label}
              aria-current={activeTab === tab.id ? "page" : undefined}
              title={tab.label}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
                {tab.icon}
              </svg>
            </button>
          ))}
        </nav>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-3">
        {activeTab === "assets" ? (
          <>
            <AssetsStore assets={assets} selectedAssetId={selectedAssetId} onSelectAsset={onSelectAsset} />
            <MetadataPanel
              tile={selectedTile}
              characters={characters}
              onSave={onSaveTileMetadata}
            />
          </>
        ) : null}
        {activeTab === "logs" ? (
          <AgentLogPanel actions={actions} characters={characters} places={places} />
        ) : null}
        {activeTab === "tools" ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <ModePanel
              mode={mode}
              onSetMode={onSetMode}
              isRunning={isRunning}
              onRunPopulationStep={onRunPopulationStep}
            />
            <ToolTestPanel
              plan={toolTestPlan}
              stepIndex={toolTestStepIndex}
              status={toolTestStatus}
              isRunning={isRunning}
              mode={mode}
              onRunStep={onRunToolTestStep}
              onReset={onResetToolTest}
            />
          </div>
        ) : null}
        {activeTab === "chat" ? <ChatPanel messages={messages} /> : null}
      </div>
    </aside>
  );
}
