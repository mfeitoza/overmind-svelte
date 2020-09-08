import { EventType, IConfiguration, IReaction, Overmind } from 'overmind'
import { IMutationCallback, ITrackStateTree, ITrackCallback, IS_PROXY } from 'proxy-state-tree'
import { onMount, afterUpdate, onDestroy, setContext, getContext } from 'svelte'
import type { Readable } from 'svelte/store'
import _get from 'lodash/fp/get'

const STORE = Symbol('Overmind Store')
const IS_PRODUCTION = false

let nextComponentId = 0

export type State<T> = T & Readable<T>
export interface Mixin<Config extends IConfiguration> {
  state: State<Overmind<Config>['state']>
  actions: Overmind<Config>['actions']
  effects: Overmind<Config>['effects']
  addMutationListener: Overmind<Config>['addMutationListener']
  reaction: Overmind<Config>['reaction']
}



export function createMixin<ThisConfig extends IConfiguration>(
  overmind: Overmind<ThisConfig>
): Mixin<ThisConfig> {
  const TREES = new Map()
  const componentId = nextComponentId++
  let nextComponentInstanceId = 0
  let currentFlushId = 0

  const subscribe = (listener: Function) => {
    const tree = (overmind as any).proxyStateTree.getTrackStateTreeWithProxifier() as ITrackStateTree<Overmind<ThisConfig>>
    const componentInstanceId = nextComponentInstanceId++
    const componentName = "$tree" + componentInstanceId

    let isUpdating = false

    const onUpdate: ITrackCallback = (
      mutations,
      paths,
      flushId
    ) => {
      tree.track(onUpdate)
      currentFlushId = flushId
      isUpdating = true
      listener(tree.state)
    }
    
    tree.track(onUpdate)

    listener(tree.state)

    if (IS_PRODUCTION) {
      afterUpdate(() => {
        tree.stopTracking()
        isUpdating = false
      })
    } else {
      onMount(() => {
        const store = getContext(STORE) as Mixin<ThisConfig>
        tree.pathDependencies.forEach(path => {
          const proxy = _get(path, tree.state)
          if (proxy[IS_PROXY]) {
            if (TREES.get(path)) {
              console.log('rescope')
              TREES.set(path, (overmind as any).proxyStateTree.rescope(proxy, tree))
            }
            TREES.set(path, proxy)
          }
        })
        console.log(TREES)
        overmind.eventHub.emitAsync(EventType.COMPONENT_ADD, {
          componentId,
          componentInstanceId,
          name: componentName,
          paths: Array.from(tree.pathDependencies),
        })
      })

      afterUpdate(() => {
        const pathDependencies = Array.from(tree.pathDependencies)
        
        tree.stopTracking()

        if (isUpdating) {
          overmind.eventHub.emitAsync(EventType.COMPONENT_UPDATE, {
            componentId,
            componentInstanceId,
            name: '',
            flushId: currentFlushId,
            paths: Array.from(tree.pathDependencies),
          })
        }
        isUpdating = false
      })
    }

    return () => {
      ;(overmind as any).proxyStateTree.disposeTree(tree)
      overmind.eventHub.emitAsync(EventType.COMPONENT_REMOVE, {
        componentId,
        componentInstanceId: componentInstanceId,
        name: '',
      })
    }
  }

  const reaction: IReaction<ThisConfig> = (
    stateCallback,
    updateCallback,
    options?
  ) => {
    const dispose = overmind.reaction(stateCallback, updateCallback, options)

    onDestroy(() => {
      dispose()
    })
    return dispose
  }

  const state: State<Overmind<ThisConfig>['state']> = {
    ...overmind.state,
    subscribe,
  }

  const store = {
    state,
    actions: overmind.actions,
    effects: overmind.effects,
    addMutationListener: overmind.addMutationListener,
    reaction: reaction,
  }

  setContext(STORE, store)

  return store
}

export function getStore<Config extends IConfiguration>() {
  return getContext(STORE) as Mixin<Config>
}

export function useStore<Config extends IConfiguration>(): () => Mixin<Config> {
  return () => getContext(STORE) as any
}