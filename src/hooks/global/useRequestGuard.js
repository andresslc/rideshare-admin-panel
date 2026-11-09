import { useCallback, useEffect, useRef } from "react";

/**
 * Keeps a list in sync with the newest request only.
 *
 * Typing "abc" then "abcd" fires two requests. Without a guard, whichever
 * response lands last wins — so a slow "abc" response can arrive after "abcd"
 * and repaint the table with stale results. This fixes that two ways:
 *
 *   1. `signal` cancels the previous in-flight request as soon as a new one
 *      starts, so the server isn't answering questions nobody is asking.
 *   2. `isCurrent()` is the safety net for a response that was already in
 *      flight when the abort fired — the caller drops it instead of rendering it.
 *
 * Usage:
 *
 *   const beginRequest = useRequestGuard();
 *
 *   const fetchRows = useCallback(async () => {
 *     const { signal, isCurrent } = beginRequest();
 *     setLoading(true);
 *     try {
 *       const response = await api.getThings(page, limit, search, { signal });
 *       if (!isCurrent()) return;
 *       setRows(response.data || []);
 *     } catch (error) {
 *       if (!isCurrent() || isAbortError(error)) return;
 *       handleError(error);
 *     } finally {
 *       if (isCurrent()) setLoading(false);
 *     }
 *   }, [page, limit, search, beginRequest]);
 *
 * Note `loading` is only cleared by the current request, so the spinner stays up
 * continuously while a superseded request is replaced rather than flickering off.
 */
const useRequestGuard = () => {
  const controllerRef = useRef(null);
  const sequenceRef = useRef(0);

  // Abort whatever is in flight when the component unmounts.
  useEffect(
    () => () => {
      controllerRef.current?.abort();
      // Nothing after unmount is "current", so late responses are dropped too.
      sequenceRef.current += 1;
    },
    [],
  );

  return useCallback(() => {
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    const sequence = (sequenceRef.current += 1);

    return {
      signal: controller.signal,
      isCurrent: () => sequence === sequenceRef.current,
    };
  }, []);
};

export default useRequestGuard;
export { useRequestGuard };
