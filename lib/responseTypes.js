let contextDelimiter = "::";

const responseTypes = {
  message(p_sText) {
    return {
      "message": {
        "text": p_sText
      }
    }
  },
  quickReply(title, payload, image_url) {
    const reply = {
      "content_type": "text",
      title,
      payload
    }

    if (image_url)
      reply.image_url = image_url

    return reply;
  },
  quickReplyGroup(title, replies, context) {
    if (context) {
      replies.forEach(reply => reply.payload += (contextDelimiter + context))
    }

    return {
      "message": {
        "text": title,
        "quick_replies": replies
      }
    }
  },
  button(title, url, ratio) {
    return {
      "type": "web_url",
      url,
      title,
      "webview_height_ratio": ratio || "full"
    }
  },
  buttonGroup(title, buttons) {
    return {
      "message": {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "button",
            "text": title,
            buttons
          }
        }
      }
    }
  }
}

module.exports = {
  getContextDelimiter() {
    return contextDelimiter
  },
  setContextDelimiter(p_sDelimiter) {
    contextDelimiter = p_sDelimiter;
  },
  responseTypes
};
