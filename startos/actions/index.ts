import { sdk } from '../sdk'
import { config } from './config'
import { relayStatus } from './relayStatus'

export const actions = sdk.Actions.of().addAction(config).addAction(relayStatus)
