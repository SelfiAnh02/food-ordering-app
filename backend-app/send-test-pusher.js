// Simple script to send a test event to Pusher
const pusher = require("./utils/pusherClient");

const data = {
  title: "Test Order",
  message: "Order #123 status updated to ready",
  orderId: 123,
};

pusher.trigger("staff-orders", "order-updated", data, (err, req, res) => {
  if (err) {
    console.error("Pusher trigger error:", err);
    process.exit(1);
  }
  console.log("Pusher event sent");
  process.exit(0);
});
