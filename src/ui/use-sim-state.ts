import { useEffect, useState } from "react";
import { getState, subscribe } from "../sim-state";

export function useSimState() {
  const [state, setState] = useState(getState);

  useEffect(() => subscribe(setState), []);

  return state;
}
