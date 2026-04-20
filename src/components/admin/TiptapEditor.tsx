import React, { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    minHeightClassName?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) {
        return null;
    }

    const imageInputRef = useRef<HTMLInputElement | null>(null);

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImageByUrl = useCallback(() => {
        const url = window.prompt('Image URL');

        if (!url) return;

        editor.chain().focus().setImage({ src: url }).run();
    }, [editor]);

    const addImageByUpload = useCallback(
        async (file?: File) => {
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                const src = typeof reader.result === 'string' ? reader.result : '';
                if (!src) return;
                editor.chain().focus().setImage({ src }).run();
            };
            reader.readAsDataURL(file);
        },
        [editor]
    );

    const isHeading2 = editor.isActive('heading', { level: 2 });
    const isHeading3 = editor.isActive('heading', { level: 3 });

    return (
        <div className="border border-border rounded-t-xl bg-gray-50 p-2 flex flex-wrap gap-2 sticky top-0 z-10 shadow-sm">
            <button
                type="button"
                title="Undo"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="px-2 py-1.5 rounded-md text-sm font-semibold transition-colors hover:bg-gray-200 text-text-secondary disabled:opacity-50"
            >
                Undo
            </button>
            <button
                type="button"
                title="Redo"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="px-2 py-1.5 rounded-md text-sm font-semibold transition-colors hover:bg-gray-200 text-text-secondary disabled:opacity-50"
            >
                Redo
            </button>
            <div className="w-px bg-border mx-1 my-1" />
            <button
                type="button"
                title="Bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`px-2 py-1.5 rounded-md text-sm font-semibold transition-colors ${editor.isActive('bold') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                B
            </button>
            <button
                type="button"
                title="Italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`px-2 py-1.5 rounded-md text-sm italic transition-colors ${editor.isActive('italic') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                I
            </button>
            <button
                type="button"
                title="Underline"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`px-2 py-1.5 rounded-md text-sm underline transition-colors ${editor.isActive('underline') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                U
            </button>
            <button
                type="button"
                title="Strikethrough"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={`px-2 py-1.5 rounded-md text-sm line-through transition-colors ${editor.isActive('strike') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                S
            </button>
            <button
                type="button"
                title="Inline Code"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`px-2 py-1.5 rounded-md text-sm font-mono transition-colors ${editor.isActive('code') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                {'</>'}
            </button>
            <div className="w-px bg-border mx-1 my-1" />
            <button
                type="button"
                title="Paragraph"
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`px-2 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                    !isHeading2 && !isHeading3 ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'
                }`}
            >
                P
            </button>
            <button
                type="button"
                title="Heading 2"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 py-1.5 rounded-md text-sm font-bold transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                H2
            </button>
            <button
                type="button"
                title="Heading 3"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-2 py-1.5 rounded-md text-sm font-bold transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                H3
            </button>
            <div className="w-px bg-border mx-1 my-1" />
            <button
                type="button"
                title="Bullet List"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-2 py-1.5 rounded-md text-sm transition-colors ${editor.isActive('bulletList') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                • List
            </button>
            <button
                type="button"
                title="Numbered List"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`px-2 py-1.5 rounded-md text-sm transition-colors ${editor.isActive('orderedList') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                1. List
            </button>
            <button
                type="button"
                title="Block Quote"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`px-2 py-1.5 rounded-md text-sm transition-colors ${editor.isActive('blockquote') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                "Quote
            </button>
            <button
                type="button"
                title="Code Block"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`px-2 py-1.5 rounded-md text-sm font-mono transition-colors ${editor.isActive('codeBlock') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                Code
            </button>
            <button
                type="button"
                title="Horizontal Line"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-gray-200 text-text-secondary"
            >
                HR
            </button>
            <div className="w-px bg-border mx-1 my-1" />
            <button
                type="button"
                title="Set Link"
                onClick={setLink}
                className={`px-2 py-1.5 rounded-md text-sm transition-colors ${editor.isActive('link') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                Link
            </button>
            <button
                type="button"
                title="Insert Image by URL"
                onClick={addImageByUrl}
                className={`px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-gray-200 text-text-secondary`}
            >
                Image URL
            </button>
            <button
                type="button"
                title="Upload Image"
                onClick={() => imageInputRef.current?.click()}
                className="px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-gray-200 text-text-secondary"
            >
                Upload Image
            </button>
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                title="Upload image"
                aria-label="Upload image"
                onChange={async (e) => {
                    const file = e.target.files?.[0];
                    await addImageByUpload(file);
                    e.currentTarget.value = '';
                }}
            />
            <div className="w-px bg-border mx-1 my-1" />
            <button
                type="button"
                title="Clear Formatting"
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .clearNodes()
                        .unsetAllMarks()
                        .run()
                }
                className="px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-gray-200 text-text-secondary"
            >
                Clear
            </button>
        </div>
    );
};

export default function TiptapEditor({
    content,
    onChange,
    minHeightClassName = 'min-h-[300px]',
}: TiptapEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl max-w-full h-auto object-cover my-6 shadow-md border border-border/50',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary hover:text-primary-dark underline underline-offset-4 decoration-2 decoration-primary/30 transition-colors',
                },
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: `prose prose-slate max-w-none ${minHeightClassName} p-6 focus:outline-none focus:ring-4 focus:ring-primary/10 rounded-b-xl border border-t-0 border-border bg-white`,
            },
        },
    });

    useEffect(() => {
        if (!editor) return;
        const current = editor.getHTML();
        if (content !== current) {
            editor.commands.setContent(content || '', { emitUpdate: false });
        }
    }, [content, editor]);

    return (
        <div className="w-full flex flex-col relative rounded-xl shadow-sm">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
