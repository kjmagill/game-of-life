import { useEffect, useRef } from 'react';

// custom hook similar to setInterval() but its arguments are dynamic
// the hook sets up an interval then clears it after unmounting
// we'll use it in App.js to execute the runGame() function every 1000ms
function useInterval(callback, delay) {
  const savedCallback = useRef();

  // remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default useInterval;
