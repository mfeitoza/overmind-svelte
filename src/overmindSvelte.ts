import { EventType, IConfiguration, IReaction, Overmind } from 'overmind'
import type { IMutationCallback } from 'proxy-state-tree'
import { onMount, afterUpdate, onDestroy, setContext, getContext } from 'svelte'
import type { Readable } from 'svelte/store'

const IS_PRODUCTION = false

let nextComponentId = 0

export type State<T> = T & Readable<T>

export function createMixin<ThisConfig extends IConfiguration>(
  overmind: Overmind<ThisConfig>
) {
  console.log('create mixin')
  const componentId = nextComponentId++
  let nextComponentInstanceId = 0
  let currentFlushId = 0

  const subscribe = (listener: Function) => {
    const tree = (overmind as any).proxyStateTree.getTrackStateTreeWithProxifier()
    const componentInstanceId = nextComponentInstanceId++
    let isUpdating = false

    const onUpdate = (
      mutations: IMutationCallback,
      paths: Array<string>,
      flushId: number
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
        overmind.eventHub.emitAsync(EventType.COMPONENT_ADD, {
          componentId,
          componentInstanceId,
          name: '',
          paths: Array.from(tree.pathDependencies),
        })
      })

      afterUpdate(() => {
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

  setContext('@store', store)

  return store
}

export function getStore<ThisConfig extends IConfiguration>(): Overmind<ThisConfig> {
  console.log('get store')
  const store = getContext('@store')
  return store
}