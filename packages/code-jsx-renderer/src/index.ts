import parseAttrs from 'attributes-parser'
import type { MarkedExtension } from 'marked'
import { transform } from './transform.js'
import { isPlainObject } from './utils.js'
import type { Options } from './types.js'

export type { Options }

/**
 * A [marked](https://marked.js.org/) extension to render JSX code blocks using a custom renderer and components.
 *
 * @param options - The configuration options for the extension.
 */
export default function markedCodeJsxRenderer(
  options: Options = {}
): MarkedExtension {
  const { unwrap } = options
  const allowedLangs = ['react', 'javascriptreact', 'jsx']

  return {
    extensions: [
      {
        name: 'code',
        level: 'block',
        tokenizer(_, parent) {
          parent.forEach((token, index) => {
            if (token.type !== 'code' || !token.lang || !token.text) return

            // support for inline options, only for the `unwrap` option.
            // ```jsx renderable="{ unwrap: true }"
            // ```
            const { renderable } = parseAttrs(token.lang)
            const isRenderable =
              renderable &&
              allowedLangs.indexOf(token.lang.split(' ')[0]) !== -1

            if (!isRenderable) return

            const inlineOptions = isPlainObject(renderable)
              ? (renderable as Options)
              : {}

            transform(token, {
              index,
              parent,
              ...options,
              unwrap: inlineOptions.unwrap || unwrap
            })
          })

          return undefined
        }
      }
    ]
  }
}
