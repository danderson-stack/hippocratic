declare module "cors" {
  import { RequestHandler } from "express";
  const cors: (options?: unknown) => RequestHandler;
  export default cors;
}
