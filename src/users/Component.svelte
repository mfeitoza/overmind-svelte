<script lang="ts">
    import { getStore } from '../overmindSvelte'
    const { state, actions } = getStore()
    let text = ''
    
    $: {
        console.log(text)
        actions.users.input(text)
    }

    $: userInput = state.users.input
</script>

<h1>User: </h1>
<input type="text" bind:value={text} />
<p>User input: {userInput}</p>

<br />