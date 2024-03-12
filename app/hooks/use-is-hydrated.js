import {useState, useEffect, useLayoutEffect} from "react";

export default function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);
  ('undefined' === typeof window ? useEffect : useLayoutEffect)(() => setIsHydrated(true), []);
  return isHydrated;
}
