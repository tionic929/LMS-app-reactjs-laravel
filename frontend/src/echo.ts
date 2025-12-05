// echo.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

export const echo = new Echo({
    broadcaster: 'pusher',
    key: '401ae79568ea4d18c74f',        // from Pusher dashboard
    cluster: 'ap1',             // your cluster
    forceTLS: true,             // true for HTTPS
    encrypted: true,
});
