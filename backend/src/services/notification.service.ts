import { prisma } from "../../lib/prisma";

// Send manual notification
export const sendNotification = async (
  userId: string,
  messageType: string,
  channel: "sms" | "whatsapp" | "email"
) => {
  // Mock sending logic
  console.log(`Sending ${channel} to user ${userId}: ${messageType}`);

  return await prisma.notification.create({
    data: {
      user_id: BigInt(userId),
      message_type: messageType,
      channel: channel,
      status: "sent",
    },
  });
};

// Send payment reminder
export const sendPaymentAlert = async (userId: string) => {
  // Logic to check overdue amount could be here, but for now just sending alert
  return await sendNotification(userId, "Payment Reminder", "whatsapp");
};

// View notification history
export const getNotifications = async (userId: string) => {
  return await prisma.notification.findMany({
    where: { user_id: BigInt(userId) },
    orderBy: { sent_at: "desc" },
  });
};
