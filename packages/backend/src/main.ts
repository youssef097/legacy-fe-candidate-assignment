import { register } from 'tsconfig-paths'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url || '')
const __dirname = dirname(__filename)

register({
  baseUrl: resolve(__dirname, '..'),
  paths: {
    '@/*': ['./src/*'],
    '@controllers/*': ['./src/controllers/*'],
    '@services/*': ['./src/services/*'],
    '@middleware/*': ['./src/middleware/*'],
    '@routes/*': ['./src/routes/*'],
    '@types/*': ['./src/types/*'],
    '@utils/*': ['./src/utils/*'],
    '@shared/*': ['../shared/src/*']
  }
})

import './index.js'
