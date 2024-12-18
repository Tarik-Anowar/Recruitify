const { v4: uuidv4 } = require("uuid");
const connectedUsers = new Map();

let io = null;
let activeRooms = [];
const setSocketServerInstance = (ioInstance) => {
  io = ioInstance;
};

const getSocketServerInstance = () => {
  return io;
};

const addNewConnectedUser = ({ socketId, userId }) => {
  connectedUsers.set(socketId, { userId });
  // console.log("new connected users");
  // console.log(connectedUsers);
};

const removeConnectedUser = (socketId) => {
  if (connectedUsers.has(socketId)) {
    connectedUsers.delete(socketId);
    // console.log("new connected users");
    // console.log(connectedUsers);
  }
};

const getActiveConnections = (userId) => {
  console.log(userId);
  var activeConnections = [];

  connectedUsers.forEach(function (value, key) {
    console.log(value.userId);
    if (value.userId.toString() === userId) {
      // if (value.userId.toString() === userId) {
      activeConnections.push(key);
    }
  });

  return activeConnections;
};

const getOnlineUsers = () => {
  const onlineUsers = [];

  connectedUsers.forEach((value, key) => {
    onlineUsers.push({ socketId: key, userId: value.userId });
  });

  return onlineUsers;
};
// rooms
const addNewActiveRoom = (userId, socketId) => {
  const newActiveRoom = {
    roomCreator: {
      userId,
      socketId,
    },
    joinRequests: [],
    participants: [
      {
        userId,
        socketId,
      },
    ],
    allowedParticipants: [],
    roomId: uuidv4(),
  };

  activeRooms = [...activeRooms, newActiveRoom];

  console.log("new active rooms: ");
  console.log(activeRooms);

  return newActiveRoom;
};

const getActiveRooms = () => {
  return [...activeRooms];
};

const getActiveRoom = (roomId) => {
  const activeRoom = activeRooms.find(
    (activeRoom) => activeRoom.roomId === roomId
  );

  if (activeRoom) {
    return {
      ...activeRoom,
    };
  } else {
    return null;
  }
};

const joinRequestRomm = (roomId, participants) => {
  const room = activeRooms.find((room) => room.roomId === roomId);

  activeRooms = activeRooms.filter((room) => room.roomId !== roomId);

  const updatedRoom = {
    ...room,
    joinRequests: [...room.joinRequests, participants],
  };

  activeRooms.push(updatedRoom);
};

const joinActiveRoom = (roomId, newParticipant) => {
  const room = activeRooms.find((room) => room.roomId === roomId);
  console.log("room has been found");

  activeRooms = activeRooms.filter((room) => room.roomId !== roomId);
  console.log(activeRooms);

  const updatedRoom = {
    ...room,
    joinRequests: room.joinRequests.filter(
      (participant) => participant.socketId !== newParticipant.socketId
    ),
    participants: [...room.participants, newParticipant],
  };

  activeRooms.push(updatedRoom);
};

const removeJoinRequest = (roomId, newParticipant) => {
  const room = activeRooms.find((room) => room.roomId === roomId);

  activeRooms = activeRooms.filter((room) => room.roomId !== roomId);

  const updatedRoom = {
    ...room,
    joinRequests: room.joinRequests.filter(
      (participant) => participant.socketId !== newParticipant.socketId
    ),
  };
  if (updatedRoom.participants.length > 0) {
    activeRooms.push(updatedRoom);
  }
};

const addAllParticipants = (roomId, participants) => {
  const room = activeRooms.find((room) => room.roomId === roomId);

  activeRooms = activeRooms.filter((room) => room.roomId !== roomId);

  const updatedRoom = {
    ...room,
    participants: [...room.participants, ...participants],
  };

  activeRooms.push(updatedRoom);
};
const leaveActiveRoom = (roomId, participantSocketId) => {
  const activeRoom = activeRooms.find((room) => room.roomId === roomId);

  if (activeRoom) {
    const copyOfActiveRoom = { ...activeRoom };

    copyOfActiveRoom.participants = copyOfActiveRoom.participants.filter(
      (participant) => participant.socketId !== participantSocketId
    );

    activeRooms = activeRooms.filter((room) => room.roomId !== roomId);
    if (copyOfActiveRoom.participants.length > 0) {
      activeRooms.push(copyOfActiveRoom);
    }
  }
};
//if room is updated then return those roomId
const leaveActiveRoomBySocketId = (socketId) => {
  let roomIds = [];
  activeRooms.forEach((room) => {
    const copyOfActiveRoom = { ...room };
    copyOfActiveRoom.participants = copyOfActiveRoom.participants.filter(
      (participant) => participant.socketId !== socketId
    );

    activeRooms = activeRooms.filter(
      (room) => room.roomId !== copyOfActiveRoom.roomId
    );
    if (copyOfActiveRoom.participants.length > 0) {
      activeRooms.push(copyOfActiveRoom);
      roomIds.push(copyOfActiveRoom.roomId);
    }
  });
  return roomIds;
};

module.exports = {
  addNewConnectedUser,
  removeConnectedUser,
  getActiveConnections,
  setSocketServerInstance,
  getSocketServerInstance,
  getOnlineUsers,
  addNewActiveRoom,
  getActiveRooms,
  getActiveRoom,
  joinActiveRoom,
  leaveActiveRoom,
  joinRequestRomm,
  addAllParticipants,
  leaveActiveRoomBySocketId,
  removeJoinRequest,
};
