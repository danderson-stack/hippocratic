declare module "express" {
  const exp: any;
  export default exp;
  export const Router: any;
  export type Request = any;
  export type Response = any;
  export type NextFunction = any;
}

declare module "openai" {
  const OpenAI: any;
  export default OpenAI;
}
