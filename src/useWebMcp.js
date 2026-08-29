import { useEffect, useRef, useState } from "react";
import {
  inferWorkshopPhase,
  isWebMcpDisabled,
  registerWorkshopTools,
} from "./webmcp";

export default function useWebMcp(state, actions, getAuthoritativeState) {
  const actionsRef = useRef(actions);
  const getStateRef = useRef(getAuthoritativeState);
  const [status, setStatus] = useState("detecting");
  actionsRef.current = actions;
  getStateRef.current = getAuthoritativeState;
  const phase = inferWorkshopPhase(state);
  const disabled = isWebMcpDisabled();

  useEffect(() => {
    let mounted = true;
    if (disabled) {
      setStatus("unavailable");
      return undefined;
    }
    const tools = registerWorkshopTools({
      getState: () => getStateRef.current?.() || state,
      getActions: () => actionsRef.current,
    });

    if (!tools.supported) {
      setStatus("unavailable");
      return tools.dispose;
    }

    tools.registration.then(
      () => mounted && setStatus("ready"),
      () => mounted && setStatus("error"),
    );

    return () => {
      mounted = false;
      tools.dispose();
    };
  }, [disabled, phase]);

  return status;
}
