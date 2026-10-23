import React from 'react'

export interface TocHeading {
  id: string
  text: string
  level: number
}

/**
 * Extracts H2 and H3 headings from Tiptap JSON document for Table of Contents
 */
export function extractHeadingsFromTiptap(json: any): TocHeading[] {
  const headings: TocHeading[] = []
  if (!json || !Array.isArray(json.content)) return headings

  const headingCounts: Record<string, number> = {}

  function getNodeText(node: any): string {
    if (!node) return ''
    if (typeof node.text === 'string') return node.text
    if (Array.isArray(node.content)) {
      return node.content.map(getNodeText).join('')
    }
    return ''
  }

  json.content.forEach((node: any) => {
    if (node.type === 'heading' && (node.attrs?.level === 2 || node.attrs?.level === 3)) {
      const text = getNodeText(node).trim()
      if (text) {
        let slug = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')

        if (!slug) slug = 'section'

        // Handle duplicate heading text
        if (headingCounts[slug]) {
          headingCounts[slug] += 1
          slug = `${slug}-${headingCounts[slug]}`
        } else {
          headingCounts[slug] = 1
        }

        headings.push({
          id: slug,
          text,
          level: node.attrs.level,
        })
      }
    }
  })

  return headings
}

interface TiptapRendererProps {
  content: any
  className?: string
}

/**
 * Safe, zero-DOM React AST renderer for Tiptap JSON.
 * Renders AST nodes to semantic HTML elements with deterministic anchor IDs for TOC.
 */
export function TiptapRenderer({ content, className = '' }: TiptapRendererProps) {
  if (!content || !content.content || !Array.isArray(content.content)) {
    return (
      <div className="text-muted-foreground font-serif italic py-8">
        No manuscript body content recorded.
      </div>
    )
  }

  const headingCounts: Record<string, number> = {}

  function renderMarks(text: string, marks?: any[]): React.ReactNode {
    if (!marks || marks.length === 0) return text

    return marks.reduce<React.ReactNode>((acc, mark, index) => {
      switch (mark.type) {
        case 'bold':
          return <strong key={index} className="font-bold text-foreground">{acc}</strong>
        case 'italic':
          return <em key={index} className="italic">{acc}</em>
        case 'underline':
          return <u key={index} className="underline underline-offset-2">{acc}</u>
        case 'strike':
          return <s key={index} className="line-through">{acc}</s>
        case 'code':
          return (
            <code
              key={index}
              className="bg-muted text-foreground border border-border px-1.5 py-0.5 rounded-none font-mono text-[0.875em]"
            >
              {acc}
            </code>
          )
        case 'link':
          return (
            <a
              key={index}
              href={mark.attrs?.href}
              target={mark.attrs?.target || '_blank'}
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 decoration-1 hover:decoration-2 transition-all font-medium"
            >
              {acc}
            </a>
          )
        case 'superscript':
          return (
            <sup
              key={index}
              className="font-mono text-[0.75em] font-semibold text-foreground align-super ml-0.5"
            >
              {acc}
            </sup>
          )
        case 'subscript':
          return (
            <sub key={index} className="text-[0.75em] align-sub">
              {acc}
            </sub>
          )
        default:
          return acc
      }
    }, text)
  }

  function getNodeText(node: any): string {
    if (!node) return ''
    if (typeof node.text === 'string') return node.text
    if (Array.isArray(node.content)) {
      return node.content.map(getNodeText).join('')
    }
    return ''
  }

  function renderNode(node: any, index: number): React.ReactNode {
    if (!node) return null

    switch (node.type) {
      case 'paragraph':
        return (
          <p key={index} className="mb-6 leading-[1.8] text-foreground font-serif text-lg">
            {node.content ? node.content.map(renderNode) : <br />}
          </p>
        )

      case 'text':
        return renderMarks(node.text, node.marks)

      case 'heading': {
        const level = node.attrs?.level || 2
        const rawText = getNodeText(node).trim()
        let slug = rawText
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')

        if (!slug) slug = `heading-${index}`

        if (headingCounts[slug]) {
          headingCounts[slug] += 1
          slug = `${slug}-${headingCounts[slug]}`
        } else {
          headingCounts[slug] = 1
        }

        if (level === 2) {
          return (
            <h2
              key={index}
              id={slug}
              className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-12 mb-4 pt-6 border-t border-border/80 scroll-mt-24 group flex items-baseline justify-between"
            >
              <span>{node.content?.map(renderNode)}</span>
              <a
                href={`#${slug}`}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground text-xs font-mono ml-2 transition-opacity"
                aria-label="Direct link to section"
              >
                #
              </a>
            </h2>
          )
        }

        return (
          <h3
            key={index}
            id={slug}
            className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-8 mb-3 scroll-mt-24 group flex items-baseline justify-between"
          >
            <span>{node.content?.map(renderNode)}</span>
            <a
              href={`#${slug}`}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground text-xs font-mono ml-2 transition-opacity"
              aria-label="Direct link to section"
            >
              #
            </a>
          </h3>
        )
      }

      case 'blockquote':
        return (
          <blockquote
            key={index}
            className="border-l-2 border-foreground pl-6 my-8 font-serif italic text-muted-foreground text-lg leading-relaxed bg-muted/10 py-3"
          >
            {node.content?.map(renderNode)}
          </blockquote>
        )

      case 'bulletList':
        return (
          <ul key={index} className="list-disc pl-6 mb-6 space-y-2 font-serif text-lg leading-relaxed text-foreground">
            {node.content?.map(renderNode)}
          </ul>
        )

      case 'orderedList':
        return (
          <ol key={index} className="list-decimal pl-6 mb-6 space-y-2 font-serif text-lg leading-relaxed text-foreground">
            {node.content?.map(renderNode)}
          </ol>
        )

      case 'listItem':
        return <li key={index}>{node.content?.map(renderNode)}</li>

      case 'codeBlock':
        return (
          <div key={index} className="my-8 border border-border bg-muted/30 overflow-hidden">
            <div className="px-4 py-1.5 border-b border-border bg-muted/60 text-[11px] font-mono text-muted-foreground flex items-center justify-between">
              <span>Code / Proof Specification</span>
            </div>
            <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-foreground leading-relaxed">
              <code>{node.content?.map(renderNode)}</code>
            </pre>
          </div>
        )

      case 'image':
        return (
          <figure key={index} className="my-10 border border-border bg-muted/10 p-2 sm:p-4 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={node.attrs?.src}
              alt={node.attrs?.alt || 'Manuscript Figure'}
              className="max-w-full h-auto mx-auto border border-border shadow-sm"
              loading="lazy"
            />
            {node.attrs?.alt && (
              <figcaption className="text-xs font-mono text-muted-foreground mt-3 italic">
                Figure: {node.attrs.alt}
              </figcaption>
            )}
          </figure>
        )

      case 'horizontalRule':
        return <hr key={index} className="my-12 border-border" />

      case 'hardBreak':
        return <br key={index} />

      default:
        if (node.content && Array.isArray(node.content)) {
          return <div key={index}>{node.content.map(renderNode)}</div>
        }
        return null
    }
  }

  return (
    <div className={`manuscript-body ${className}`}>
      {content.content.map(renderNode)}
    </div>
  )
}

