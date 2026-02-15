import { toast } from "vue-sonner";
import { SocketEvents } from '@caphne/shared/socket-events'


type MessageData = {
  matchId: number;
  messageId: number;
  senderId: number;
  content: string;
  createdAt: string;
}
const unreadCounts = ref<Map<number, number>>(new Map());
let listenerAttached = false;

export const useChatNotifications = () => {
  const { getSocket } = useSocket();
  const route = useRoute();

  const initUnreadCounts = ((matches: { matchId: number; unreadCount: number }[]) => {
    const map = new Map<number, number>()
    for (const m of matches) {
      if (m.unreadCount > 0) map.set(m.matchId, m.unreadCount)
    }
    unreadCounts.value = map
  })

  const showBrowserNotification = (title: string, body: string) => {
    new Notification(title, { body, icon: "/favicon.ico" });
  };

  const showToast = (data: MessageData) => {
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

  const requestBrowserPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const attachListeners = () => {
    if (listenerAttached) return;
    const socket = getSocket();
    if (!socket) return;

    socket.on(SocketEvents.HAS_NEW_MESSAGE,
      (messageData: MessageData) => {
        if (route.path !== `/chat/${messageData.matchId}`) {
          showToast(messageData)
        }

        if (
          "Notification" in window &&
          Notification.permission === "granted" &&
          document.hidden
        ) {
          showBrowserNotification("New message", messageData.content);
        }

        const current = unreadCounts.value.get(messageData.matchId) || 0;
        unreadCounts.value.set(messageData.matchId, current + 1);
        unreadCounts.value = new Map(unreadCounts.value);
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
    attachListeners,
    requestBrowserPermission,
    clearUnread,
    initUnreadCounts,
    getUnreadCount,
    unreadCounts: readonly(unreadCounts),
  };
};
