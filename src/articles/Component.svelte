<script lang="ts">
    import { getStore } from '../overmind'
    const { state, actions } = getStore()
    $: userInput = $state.users.input
    $: name = $state.articles.module
</script>

<h1>{name}</h1>
<p>User input: {userInput}</p>