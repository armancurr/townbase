import { useEffect, useState } from "react";
import type { Doc } from "../../../convex/_generated/dataModel";
import type { PlaceKind } from "../../types";

const placeKindOptions: PlaceKind[] = [
	"home",
	"market",
	"diner",
	"school",
	"work",
	"nature",
	"road",
	"building",
];

type MetadataPanelProps = {
	tile: Doc<"tiles"> | undefined;
	characters: Doc<"characters">[];
	onSave: (
		stableId: string,
		label: string,
		placeKind: PlaceKind,
		ownerCharacterId: string | null,
	) => void;
};

export function MetadataPanel({
	tile,
	characters,
	onSave,
}: MetadataPanelProps) {
	const [label, setLabel] = useState("");
	const [placeKind, setPlaceKind] = useState<PlaceKind>("building");
	const [ownerCharacterId, setOwnerCharacterId] = useState<string>("");

	useEffect(() => {
		if (!tile) {
			return;
		}
		setLabel(tile.label);
		setPlaceKind(tile.placeKind);
		setOwnerCharacterId(tile.ownerCharacterId ?? "");
	}, [tile]);

	if (!tile) {
		return (
			<section className="mt-3 rounded-md bg-[#17201d]/72 p-3 text-xs text-[#cdd8c4]/70">
				Select a placed asset to edit metadata.
			</section>
		);
	}

	return (
		<form
			className="mt-3 flex flex-col gap-2 rounded-md bg-[#17201d]/72 p-3 text-xs text-[#eef4ea]"
			onSubmit={(event) => {
				event.preventDefault();
				onSave(tile.stableId, label, placeKind, ownerCharacterId || null);
			}}
			aria-label="Place metadata"
		>
			<div className="flex items-center justify-between gap-3">
				<span className="font-semibold">Place Metadata</span>
				<span className="truncate text-[#cdd8c4]/75">{tile.assetId}</span>
			</div>
			<input
				value={label}
				onChange={(event) => setLabel(event.target.value)}
				className="h-9 rounded border border-[#53635b] bg-[#101820] px-2 text-[#eef4ea] outline-none"
				aria-label="Place label"
			/>
			<div className="grid grid-cols-2 gap-2">
				<select
					value={placeKind}
					onChange={(event) => setPlaceKind(event.target.value as PlaceKind)}
					className="h-9 rounded border border-[#53635b] bg-[#101820] px-2 text-[#eef4ea] outline-none"
					aria-label="Place kind"
				>
					{placeKindOptions.map((kind) => (
						<option key={kind} value={kind}>
							{kind}
						</option>
					))}
				</select>
				<select
					value={ownerCharacterId}
					onChange={(event) => setOwnerCharacterId(event.target.value)}
					className="h-9 rounded border border-[#53635b] bg-[#101820] px-2 text-[#eef4ea] outline-none"
					aria-label="Owner character"
				>
					<option value="">No owner</option>
					{characters.map((character) => (
						<option key={character.characterId} value={character.characterId}>
							{character.label}
						</option>
					))}
				</select>
			</div>
			<button
				type="submit"
				className="h-9 rounded bg-[#d9e4cd] px-3 text-[#17201d]"
			>
				Save
			</button>
		</form>
	);
}
