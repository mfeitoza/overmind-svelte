<script lang="ts">
    import {setContext} from 'svelte'
    import { getStore } from '../overmind'
    setContext('$name', 'test')
    const { state, actions } = getStore()
    let text = ''
    
    $: {
        console.log(text)
        actions.users.input(text)
    }

    $: userInput = $state.users.input
    $: name = $state.users.module
</script>

<h1>{name} </h1>
<input type="text" bind:value={text} />
<p>User input: {userInput}</p>

<br />