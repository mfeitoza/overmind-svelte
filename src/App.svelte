<script lang="ts">
	export let overmind
	
	import { setContext } from 'svelte'
	import { createMixin } from './overmindSvelte'

	import { UsersComponent } from './users'
	import { ArticlesComponent } from './articles'

	const store = createMixin(overmind)
	const {state} = store
</script>

<style>
	:global(body) {
		margin: 0;
		font-family: Arial, Helvetica, sans-serif;
	}
	.App {
		text-align: center;
	}
	.App-header {
		background-color: #F9F6F6;
		color: #333;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-size: calc(10px + 2vmin);
	}
	.App-link {
		color: #ff3e00;
	}
	.App-logo {
		height: 40vmin;
		pointer-events: none;
		margin-bottom: 1.0rem;
		animation: App-logo-spin infinite 1.6s ease-in-out alternate;
	}
	@keyframes App-logo-spin {
		from {
			transform: scale(1);
		}
		to {
			transform: scale(1.06);
		}
	}
</style>

<div class="App">
	<UsersComponent></UsersComponent>
	<ArticlesComponent></ArticlesComponent>
	{$state.users.input}
</div>
