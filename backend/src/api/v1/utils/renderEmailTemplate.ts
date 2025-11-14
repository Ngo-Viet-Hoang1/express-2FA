import ejs from 'ejs'
import { convert } from 'html-to-text'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, unknown> = {},
): Promise<string> => {
  const filePath = path.join(
    __dirname,
    '..',
    'templates',
    `${templateName}.ejs`,
  )

  try {
    const template = await ejs.renderFile(filePath, data, { async: true })
    return template
  } catch (error) {
    throw new Error(
      `Error rendering email template "${templateName}": ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}

const htmlToTextOptions = {
  wordwrap: 130,
}

export const convertHtmlToText = (html: string): string => {
  return convert(html, htmlToTextOptions)
}

export default renderEmailTemplate
