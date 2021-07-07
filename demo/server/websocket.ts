const ws = require("nodejs-websocket");

const routes = [];

const socket = {
  server: ws
    .createServer((conn) => {
      conn.on("text", (str) => {
        const msg = JSON.parse(str);

        let routeIndex = -1;
        for (let i = 0; i < routes.length; i++) {
          if (routes[i].start === msg.type) {
            routeIndex = i;
            break;
          }
        }

        if (routeIndex === -1)
          conn.send(
            JSON.stringify({
              type: "error",
              payload: { error: "Unknown message type" },
            })
          );
        else
          dispatcher(
            msg.payload,
            { conn, locals: {} },
            ...routes[routeIndex].stops
          );
      });

      conn.on("close", (code, reason) => {
        let routeIndex = -1;
        for (let i = 0; i < routes.length; i++) {
          if (routes[i].start === "close") {
            routeIndex = i;
            break;
          }
        }
        if (routeIndex !== -1)
          dispatcher({}, { conn, locals: {} }, ...routes[routeIndex].stops);
      });

      conn.on("error", (err) => {
        console.log(`Errr on connection '${conn.key}': ${err}`);
      });
    })
    .listen(4000),

  use: (start:string, ...stops) => {
    routes.push({ start, stops });
  },

  send: (type:string, payload:any) => {
    socket.server.connections.forEach(conn => {
      conn.send({type, payload: JSON.stringify(payload)});
    });
  }
};

socket.server.on("listening", () => {
  console.log("Websocket server listnening on port 4000...");
});

socket.server.on("connection", (conn) => {
  console.log("Connection established with ", conn.key);
});

socket.server.on("close", () => {
  console.log("Websocket server has shut down");
});

socket.server.on("error", (e) => {
  console.log("Websocket error caught: ", e);
});

const dispatcher = (req, res, ...route) => {
  if (route[0])
    route[0](req, res, (error) => {
      if (error) {
        res.conn.send(JSON.stringify({ type: "error", payload: { error } }));
      } else {
        dispatcher(req, res, ...route.slice(1));
      }
    });
};

export default socket;
