import UsersComponent from './Component.svelte'
import type { Action } from 'overmind'


const input: Action<string> = ({state}, value) => {
    state.users.input = value
}

const users = {
    state: {
        module: 'Users',
        input: ''
    },
    actions: {
        input
    }
}

export {
    UsersComponent
}
export default users