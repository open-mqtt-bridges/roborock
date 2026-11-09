# Connection State

No persistent entity or database schema is added.

The bridge owns one active client and a destroyed flag. Initial setup publishes false. A ready notification may publish true only when its client is active, isInited() is true, and the bridge is not destroyed. Repeated valid notifications may republish true. Graceful destruction publishes false. A replaced or destroyed client's notification has no effect. Existing session persistence is unchanged.

The connection topic stores the last publication at the broker; it is not a continuously monitored robot-online flag and does not detect abrupt process termination.
