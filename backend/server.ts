import "dotenv/config";
import app from "./app";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 [SERVER] Backend server listening on port ${port}`);
  console.log(
    `📡 [SERVER] Agent API available at http://localhost:${port}/api/query`
  );
});
