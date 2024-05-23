const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {logger} = functions;

exports.addMessage = functions.https.onCall(async (data, context) => {
  try {
    logger.log("Received message request data:", data);

    // Validate required fields
    if (!data.text || !data.userId) {
      logger.log("Required fields (text, userId) are missing");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Required fields (text, userId) are missing",
      );
    }

    const {text, userId} = data;

    // Construct message data
    const messageData = {
      text,
      userId,
      timeStamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Add message to the user's message subcollection in Firestore
    const messageRef = await admin
        .firestore()
        .collection("chats")
        .doc(userId)
        .collection("messages")
        .add(messageData);

    logger.log("Message added successfully, message ID:", messageRef.id);

    // Return success status and message ID
    return {status: "success", messageID: messageRef.id};
  } catch (error) {
    logger.error("Error adding message:", error);
    // Throw a structuered error for the client
    throw new functions.https.HttpsError(
        "unknown",
        "An error occurred while adding the message",
        error.message,
    );
  }
});
