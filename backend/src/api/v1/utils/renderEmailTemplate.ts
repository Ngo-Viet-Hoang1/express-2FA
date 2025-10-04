import ejs from 'ejs'
import { convert } from 'html-to-text'
import path from 'path'

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
    throw new Error(`Error rendering email template: ${error}`)
  }
}

const htmlToTextOptions = {
  wordwrap: 130,
}

export const convertHtmlToText = (html: string): string => {
  return convert(html, htmlToTextOptions)
}

export default renderEmailTemplate
