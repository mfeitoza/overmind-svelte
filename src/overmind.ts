import { merge, namespaced } from "overmind/config";
import { createOvermind, IConfig } from "overmind";

import users from "./users";
import articles from "./articles";

const config = merge(
  {
    state: {
      global: "Fine!",
    },
  },
  namespaced({
    users,
    articles,
  })
);

export const overmind = createOvermind(config);

declare module "overmind" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Config
    extends IConfig<{
      state: typeof config.state;
      actions: typeof config.actions;
      effects: typeof config.effects;
    }> {}
  // Due to circular typing we have to define an
  // explicit typing of state, actions and effects since
  // TS 3.9
}
