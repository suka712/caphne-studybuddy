import { toast } from "vue-sonner";

const unreadCounts = ref<Map<number, number>>(new Map());
let listenerAttached = false;

export const useChatNotifications = () => {
  const {
    public: { apiBase },
  } = useRuntimeConfig();
  const { getSocket } = useSocket();
  const route = useRoute();

  const fetchUnreadCounts = async () => {
    try {
      const data = await $fetch<{
        unreadCounts: { matchId: number; count: number }[];
      }>(`${apiBase}/chat/unread-counts`, { credentials: "include" });
      const map = new Map<number, number>();
      for (const row of data.unreadCounts) {
        map.set(row.matchId, row.count);
      }
      unreadCounts.value = map;
    } catch (e) {
      console.error("Failed to fetch unread counts:", e);
    }
  };

  const showBrowserNotification = (title: string, body: string) => {
    if (
      "Notification" in window &&
      Notification.permission === "granted" &&
      document.hidden
    ) {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  };

  const requestBrowserPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const attachListeners = () => {
    if (listenerAttached) return;
    const socket = getSocket();
    if (!socket) return;

    socket.on(
      "new_message_notification",
      (data: {
        matchId: number;
        messageId: number;
        senderId: number;
        content: string;
        createdAt: string;
      }) => {
        const currentPath = route.path;

        if (currentPath === `/chat/${data.matchId}`) return;

        const current = unreadCounts.value.get(data.matchId) || 0;
        unreadCounts.value.set(data.matchId, current + 1);
        unreadCounts.value = new Map(unreadCounts.value);

        if (currentPath !== "/matches") {
          toast.info("New message", {
            description:
              data.content.length > 50
                ? data.content.slice(0, 50) + "..."
                : data.content,
            action: {
              label: "View",
              onClick: () => navigateTo(`/chat/${data.matchId}`),
            },
          });
        }

        showBrowserNotification("New message", data.content);
      },
    );

    listenerAttached = true;
  };

  const clearUnread = (matchId: number) => {
    unreadCounts.value.delete(matchId);
    unreadCounts.value = new Map(unreadCounts.value);
  };

  const getUnreadCount = (matchId: number) => {
    return unreadCounts.value.get(matchId) || 0;
  };

  return {
    fetchUnreadCounts,
    attachListeners,
    requestBrowserPermission,
    clearUnread,
    getUnreadCount,
    unreadCounts: readonly(unreadCounts),
  };
};
