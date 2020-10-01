import { merge, namespaced } from "overmind/config";
import { createOvermind, IConfig, Overmind } from "overmind";
import { useStore, Mixin } from './overmindSvelte'

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

export type Overmind = typeof overmind

export const getStore = useStore<typeof config>()


declare module "overmind" {
  interface Config
    extends IConfig<{
      state: typeof config.state;
      actions: typeof config.actions;
      effects: typeof config.effects;
    }> {}
}
