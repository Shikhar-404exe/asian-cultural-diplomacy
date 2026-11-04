'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Image as ImageIcon,
  Minus,
  Undo,
  Redo,
} from 'lucide-react';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TipTapEditor({
  content,
  onChange,
  placeholder = 'Begin writing your essay or article here...',
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-[350px] p-6 focus:outline-none prose-editorial max-w-none text-slate-800',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return <div className="p-8 text-center text-slate-400">Loading editor...</div>;
  }

  const addImagePrompt = () => {
    const url = window.prompt('Enter Image URL (e.g. /art/moon-bridge.jpg or an uploaded image URL):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border border-brand-border/80 rounded-xl overflow-hidden bg-brand-ivory shadow-subtle">
      {/* Visual Toolbar */}
      <div className="bg-brand-cream/80 border-b border-brand-border/80 p-2 flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-brand-powder/60 transition-colors ${
            editor.isActive('bold') ? 'bg-brand-blue text-brand-ivory' : 'text-slate-700'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-brand-powder/60 transition-colors ${
            editor.isActive('italic') ? 'bg-brand-blue text-brand-ivory' : 'text-slate-700'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-brand-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-brand-powder/60 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-brand-blue text-brand-ivory' : 'text-slate-700'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-brand-powder/60 transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-brand-blue text-brand-ivory' : 'text-slate-700'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-brand-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-brand-powder/60 transition-colors ${
            editor.isActive('bulletList') ? 'bg-brand-blue text-brand-ivory' : 'text-slate-700'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-brand-powder/60 transition-colors ${
            editor.isActive('orderedList') ? 'bg-brand-blue text-brand-ivory' : 'text-slate-700'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-brand-powder/60 transition-colors ${
            editor.isActive('blockquote') ? 'bg-brand-blue text-brand-ivory' : 'text-slate-700'
          }`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-brand-powder/60 text-slate-700 transition-colors"
          title="Divider Line"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-brand-border mx-1" />

        <button
          type="button"
          onClick={addImagePrompt}
          className="p-2 rounded hover:bg-brand-powder/60 text-slate-700 transition-colors"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="ml-auto flex items-center space-x-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded text-slate-500 hover:text-brand-navy disabled:opacity-30"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded text-slate-500 hover:text-brand-navy disabled:opacity-30"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Actual Content Editable Canvas */}
      <EditorContent editor={editor} />
    </div>
  );
}

