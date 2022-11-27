exports.handleReady = (client) => {
  client.on("ready", () => {
    client.user.setPresence({ game: { name: "chooooser" } });
  });
};
