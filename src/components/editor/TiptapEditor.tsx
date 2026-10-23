'use client'

import React, { useCallback, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import Underline from '@tiptap/extension-underline'
import TiptapImage from '@tiptap/extension-image'
import { uploadImageToStorage } from '@/lib/supabase/storage'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  FileCode2,
  Minus,
  Superscript as SuperIcon,
  Subscript as SubIcon,
  Link2,
  Unlink,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'

interface TiptapEditorProps {
  content?: any
  onChange?: (json: any, plainText: string, wordCount: number) => void
  placeholder?: string
  editable?: boolean
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Begin composing your scholarly manuscript, methodology, and theoretical findings...',
  editable = true,
}: TiptapEditorProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'font-mono text-sm',
          },
        },
      }),
      Underline,
      Superscript,
      Subscript,
      Typography,
      TiptapImage.configure({
        inline: false,
        HTMLAttributes: {
          class: 'academic-figure border border-border my-6 max-w-full h-auto mx-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || null,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      const text = editor.getText()
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      onChange?.(json, text, words)
    },
  })

  const setHyperlink = useCallback(() => {
    if (!editor) return

    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter scholarly reference or citation URL:', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const insertFootnoteRef = useCallback(() => {
    if (!editor) return
    const num = window.prompt('Enter citation or footnote index number (e.g., 1):')
    if (num) {
      editor
        .chain()
        .focus()
        .insertContent(`<sup>[${num}]</sup> `)
        .run()
    }
  }, [editor])

  const handleImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    setIsUploadingImage(true)
    const res = await uploadImageToStorage(file, 'content')
    setIsUploadingImage(false)

    if (res.error) {
      alert(`Image upload failed: ${res.error}`)
      return
    }

    if (res.url) {
      const caption = window.prompt('Enter optional figure caption or alt text:')
      editor
        .chain()
        .focus()
        .setImage({ src: res.url, alt: caption || file.name })
        .run()
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  if (!editor) {
    return (
      <div className="border border-border min-h-[420px] flex items-center justify-center p-8 bg-card text-muted-foreground font-mono text-xs">
        Initializing academic Tiptap editor engine...
      </div>
    )
  }

  const plainText = editor.getText()
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0
  const charCount = plainText.length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="border border-border bg-card flex flex-col focus-within:border-foreground/80 transition-colors">
      {/* Hidden figure image file input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleImageFileSelected}
        className="hidden"
        disabled={!editable || isUploadingImage}
      />

      {/* Sticky Editorial Toolbar */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-2 flex overflow-x-auto sm:flex-wrap items-center gap-1 text-xs">
        {/* Paragraph & Headings */}
        <div className="flex items-center space-x-0.5 border-r border-border pr-1.5 mr-1">
          <Button
            type="button"
            variant={editor.isActive('paragraph') ? 'default' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().setParagraph().run()}
            title="Standard Paragraph"
            className="rounded-none size-7"
          >
            <Pilcrow className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Section Heading (H2)"
            className="rounded-none size-7"
          >
            <Heading2 className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Subsection Heading (H3)"
            className="rounded-none size-7"
          >
            <Heading3 className="size-3.5" />
          </Button>
        </div>

        {/* Inline Formatting */}
        <div className="flex items-center space-x-0.5 border-r border-border pr-1.5 mr-1">
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Cmd+B)"
            className="rounded-none size-7"
          >
            <Bold className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Cmd+I)"
            className="rounded-none size-7"
          >
            <Italic className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline (Cmd+U)"
            className="rounded-none size-7"
          >
            <UnderlineIcon className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive('strike') ? 'default' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
            className="rounded-none size-7"
          >
            <Strikethrough className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive('code') ? 'default' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Inline Monospace Code"
            className="rounded-none size-7"
          >
            <Code className="size-3.5" />
          </Button>
        </div>

        {/* Structural Blocks */}
        <div className="flex items-center space-x-0.5 border-r border-border pr-1.5 mr-1">
          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bulleted List"
            className="rounded-none size-7"
          >
            <List className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered Sequence"
            className="rounded-none size-7"
          >
            <ListOrdered className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Academic Blockquote / Citation"
            className="rounded-none size-7"
          >
            <Quote className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Formatted Code Block"
            className="rounded-none size-7"
          >
            <FileCode2 className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Divider / Section Break"
            className="rounded-none size-7"
          >
            <Minus className="size-3.5" />
          </Button>
        </div>

        {/* Academic Citations, Media & Links */}
        <div className="flex items-center space-x-0.5 border-r border-border pr-1.5 mr-1">
          <Button
            type="button"
            variant={editor.isActive('superscript') ? 'default' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            title="Superscript (Exponent / Footnote)"
            className="rounded-none size-7"
          >
            <SuperIcon className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive('subscript') ? 'default' : 'ghost'}
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            title="Subscript (Chemical index / Variable)"
            className="rounded-none size-7"
          >
            <SubIcon className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={insertFootnoteRef}
            title="Insert Footnote Reference [n]"
            className="rounded-none h-7 px-1.5 text-[10px] font-mono"
          >
            [#]
          </Button>

          <Button
            type="button"
            variant={editor.isActive('link') ? 'default' : 'ghost'}
            size="icon-xs"
            onClick={setHyperlink}
            title={editor.isActive('link') ? 'Remove Citation Link' : 'Add Citation Link'}
            className="rounded-none size-7"
          >
            {editor.isActive('link') ? (
              <Unlink className="size-3.5" />
            ) : (
              <Link2 className="size-3.5" />
            )}
          </Button>

          {/* Insert Figure / Image */}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploadingImage}
            title="Insert Research Figure / Diagram"
            className="rounded-none size-7"
          >
            {isUploadingImage ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ImageIcon className="size-3.5" />
            )}
          </Button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center space-x-0.5 ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Cmd+Z)"
            className="rounded-none size-7"
          >
            <Undo2 className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Cmd+Shift+Z)"
            className="rounded-none size-7"
          >
            <Redo2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Tiptap Editable Canvas */}
      <div className="p-6 sm:p-10 min-h-[420px] max-w-none prose dark:prose-invert">
        <EditorContent editor={editor} />
      </div>

      {/* Editor Status Bar */}
      <div className="border-t border-border px-4 py-2 bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-muted-foreground select-none">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          <span>~{readingTime} min read</span>
        </div>

        <div className="flex items-center gap-2">
          {isUploadingImage && (
            <span className="text-foreground animate-pulse flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" />
              Uploading figure to Supabase...
            </span>
          )}
          <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>Tiptap JSON Engine</span>
        </div>
      </div>
    </div>
  )
}
