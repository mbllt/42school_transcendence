import { Test } from "@nestjs/testing";
import * as WebSocket from "ws";
import { ChatModule } from "./chat.module";

let app;

beforeAll(async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [ChatModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  // app.useWebSocketAdapter(new WsAdapter(app));
  await app.init();
});

it("should connect successfully", (done) => {
  const address = app.getHttpServer().listen().address();
  ////console.log(`http://[${address.address}]:${address.port}`);
  const baseAddress = `ws://localhost:5555/`;

  const socket = new WebSocket(baseAddress);

  socket.on("open", () => {
    // //console.log("I am connected! YEAAAP");
    done();
  });

  socket.on("close", (code, reason) => {
    //done({ code, reason });
  });

  socket.on("error", (error) => {
    done(error);
  });
});
