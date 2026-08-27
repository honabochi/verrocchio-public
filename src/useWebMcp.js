import { useEffect, useRef, useState } from "react";
import { inferWorkshopPhase, registerWorkshopTools } from "./webmcp";

export default function useWebMcp(state, actions) {
  const stateRef = useRef(state);
  const actionsRef = useRef(actions);
  const [status, setStatus] = useState("detecting");
  stateRef.current = state;
  actionsRef.current = actions;
  const phase = inferWorkshopPhase(state);

  useEffect(() => {
    let mounted = true;
    const tools = registerWorkshopTools({
      getState: () => stateRef.current,
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
  }, [phase]);

  return status;
}
