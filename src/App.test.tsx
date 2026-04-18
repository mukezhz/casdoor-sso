import { Route as IndexRoute } from "./routes/index";

test("registers root file route", () => {
  expect(IndexRoute).toBeDefined();
  expect(IndexRoute.options).toBeDefined();
});
