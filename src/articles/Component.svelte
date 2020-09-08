<script lang="ts">
    import { getStore } from '../overmindSvelte'
    console.log('articles component')
    const { state, actions } = getStore()
    $: userInput = $state.users.input
</script>

<h1>Articles</h1>
<p>User input: {userInput}</p>