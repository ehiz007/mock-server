const formatMessage = ({
  image_url,
  username,
  message,
  type,
  party_users,
  mentions,
}) => {
  if (type === "user action") {
    return {
      payload: {
        image_url,
        username,
        message,
        party_users,
      },
      type,
    };
  } else if (type === "chat") {
    return {
      payload: {
        image_url,
        username,
        message,
        mentions: mentions.length > 0 ? mentions : [],
      },
      type,
    };
  }
};

module.exports = {
  formatMessage,
};
