// Replace with call to redis cache
const partyUsers = [];
//

const userJoin = (
  socket_id = "",
  user_id = "",
  username = "",
  party_name = "",
  image_url = "",
  party_id = ""
) => {
  const user = {
    socket_id,
    user_id,
    username,
    party_name,
    image_url,
    party_id,
  };
  // Removed validation for existing user as probably a user may want to join with two devices
  partyUsers.push(user);
  const party_users = partyUsers.map((user) => user.party_id === party_id);
  return { user, party_users };
};

const getCurrentUser = (id) => {
  if (partyUsers.length > 0) {
    return partyUsers.find((user) => user.socket_id == id);
    // } else {
    //   return {
    //     socket_id: id,
    //     user_id: "N/A",
    //     username: "N/A",
    //     party_name: "N/A",
    //     image_url: "N/A",
    //     party_users: partyUsers,
    //   };
  }
};

const userLeaves = (id) => {
  let user = {};

  if (partyUsers.length > 1) {
    const index = partyUsers.findIndex((user) => user.socket_id === id);

    if (index != -1) {
      user = partyUsers[index];
      partyUsers.splice(index, 1);
      const party_users = partyUsers.map(
        (roomUser) => roomUser.party_id === user.party_id
      );
      return { party_users, user };
    }
  } else if (partyUsers.length === 1) {
    let user = partyUsers.splice(0, partyUsers.length);
    return { party_users: [], user };
  }
};

module.exports = {
  userJoin,
  getCurrentUser,
  userLeaves,
  partyUsers,
};
