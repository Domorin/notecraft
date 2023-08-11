type AlphabetKey =
	| "A"
	| "B"
	| "C"
	| "D"
	| "E"
	| "F"
	| "G"
	| "H"
	| "I"
	| "J"
	| "K"
	| "L"
	| "M"
	| "N"
	| "O"
	| "P"
	| "Q"
	| "R"
	| "S"
	| "T"
	| "U"
	| "V"
	| "W"
	| "X"
	| "Y"
	| "Z";

type NumberKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type AlphanumericKey = AlphabetKey | NumberKey;

type ModifierKey = "Ctrl" | "Shift" | "Alt";

export type Hotkey =
	| `${ModifierKey} ${ModifierKey} ${AlphanumericKey}`
	| `${ModifierKey} ${AlphanumericKey}`;
