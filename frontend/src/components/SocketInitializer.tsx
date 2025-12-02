import React from 'react';
import useSocketNotifications from "../hooks/useSocketNotifications";

/**
 * A simple, memoized component to isolate the useSocketNotifications hook call.
 * * By using React.memo(), we prevent this component (and the hook's useEffect 
 * cleanup function inside it) from running whenever the parent component 
 * (App.tsx) re-renders due to a state change, such as adding a notification.
 */
const SocketInitializer: React.FC = React.memo(() => {
    // This hook call will now only re-run its effect if its dependencies change,
    // or if its props change (it has none), effectively stopping the loop.
    useSocketNotifications();
    
    // This component renders nothing visually
    return null; 
});

// Since the component uses no props, we don't need a custom comparison function.
// The default shallow comparison is sufficient.
SocketInitializer.displayName = 'SocketInitializer';

export default SocketInitializer;