'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { AnswerContentBlock, PictureContentBlock } from '@/lib/types'
import ImageGallery from './image-gallery'

interface AnswerRendererProps {
  content: AnswerContentBlock[]
}

export default function AnswerRenderer({ content }: AnswerRendererProps) {
  // Separate text and picture blocks, keeping text blocks in order
  // and collecting all picture blocks that follow each text block as a group.
  // This allows interleaving text sections with their relevant image galleries.

  type Section =
    | { kind: 'text'; data: string }
    | { kind: 'images'; items: PictureContentBlock[] }

  const sections: Section[] = []
  let pendingImages: PictureContentBlock[] = []

  for (const block of content) {
    if (block.type === 'image') {
      pendingImages.push(block)
    } else if (block.type === 'text') {
      // If there were images before this text block, flush them first
      if (pendingImages.length > 0) {
        sections.push({ kind: 'images', items: pendingImages })
        pendingImages = []
      }
      sections.push({ kind: 'text', data: block.data })
    }
  }

  // Flush any trailing images
  if (pendingImages.length > 0) {
    sections.push({ kind: 'images', items: pendingImages })
  }

  return (
    <div className="space-y-1">
      {sections.map((section, i) => {
        if (section.kind === 'text') {
          return (
            <div key={i} className="prose-chat">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {section.data}
              </ReactMarkdown>
            </div>
          )
        }

        if (section.kind === 'images') {
          return <ImageGallery key={i} images={section.items} />
        }

        return null
      })}
    </div>
  )
}
