import type { Doc } from "../../../convex/_generated/dataModel";

type AgentLogPanelProps = {
	actions: Doc<"agentActions">[];
	characters: Doc<"characters">[];
	places: Doc<"places">[];
};

export function AgentLogPanel({
	actions,
	characters,
	places,
}: AgentLogPanelProps) {
	const characterById = new Map(
		characters.map((character) => [character.characterId, character]),
	);
	const placeByStableId = new Map(
		places.map((place) => [place.stableId, place]),
	);
	const recentActions = [...actions]
		.sort((a, b) => b.createdAt - a.createdAt)
		.slice(0, 8);

	return (
		<section className="flex min-h-0 flex-1 flex-col" aria-label="Agent log">
			<div className="mb-3 flex items-end justify-between gap-3">
				<div>
					<h2 className="text-sm font-semibold text-[#f7fbf2]">Agent Log</h2>
					<p className="mt-1 text-xs text-[#cdd8c4]/70">Latest tool calls.</p>
				</div>
			</div>
			<div className="min-h-0 flex-1 overflow-auto rounded-md bg-[#17201d]/72 p-3 font-['Geist_Mono'] text-xs scrollbar-none">
				<div className="mb-3 grid gap-1 border-b border-[#273338] pb-3 text-[#cdd8c4]">
					{characters.map((character) => (
						<div
							key={character._id}
							className="flex items-center justify-between gap-2"
						>
							<span>{character.label}</span>
							<span className="truncate text-right text-[#f7fbf2]">
								{character.currentTask ?? character.activity}
							</span>
						</div>
					))}
				</div>
				{recentActions.length === 0 ? (
					<p className="text-[#cdd8c4]/70">No agent actions yet.</p>
				) : (
					<ol className="grid gap-2">
						{recentActions.map((action) => {
							const character = characterById.get(action.characterId);
							const place = action.targetPlaceStableId
								? placeByStableId.get(action.targetPlaceStableId)
								: null;
							const target = place
								? place.label
								: action.targetCell
									? `${action.targetCell.col},${action.targetCell.row}`
									: action.message
										? `"${action.message}"`
										: "none";
							return (
								<li
									key={action._id}
									className="rounded bg-[#101820]/82 p-2 leading-5"
								>
									<div className="flex items-center justify-between gap-2">
										<span className="truncate font-semibold text-[#f7fbf2]">
											{character?.label ?? action.characterId} /{" "}
											{action.actionId}
										</span>
										<span
											className={`shrink-0 rounded px-1.5 py-0.5 ${
												action.status === "failed"
													? "bg-[#5b2222] text-[#ffd0c9]"
													: action.status === "completed"
														? "bg-[#23442f] text-[#d9e4cd]"
														: "bg-[#4b3c1b] text-[#ffe2a3]"
											}`}
										>
											{action.status}
										</span>
									</div>
									<div className="truncate text-[#cdd8c4]">
										target: {target}
									</div>
									<div className="break-words text-[#f7fbf2]">
										reason: {action.reason}
									</div>
									{action.result ? (
										<div className="break-words text-[#cdd8c4]">
											result: {action.result}
										</div>
									) : null}
								</li>
							);
						})}
					</ol>
				)}
			</div>
		</section>
	);
}
