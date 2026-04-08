import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

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

    const addImage = useCallback(() => {
        const url = window.prompt('URL');

        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    return (
        <div className="border border-border rounded-t-xl bg-gray-50 p-2 flex flex-wrap gap-2 sticky top-0 z-10 shadow-sm">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`px-2 py-1.5 rounded-md text-sm font-semibold transition-colors ${editor.isActive('bold') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                B
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`px-2 py-1.5 rounded-md text-sm italic transition-colors ${editor.isActive('italic') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                I
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={`px-2 py-1.5 rounded-md text-sm line-through transition-colors ${editor.isActive('strike') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                S
            </button>
            <div className="w-px bg-border mx-1 my-1"></div>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 py-1.5 rounded-md text-sm font-bold transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-2 py-1.5 rounded-md text-sm font-bold transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                H3
            </button>
            <div className="w-px bg-border mx-1 my-1"></div>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-2 py-1.5 rounded-md text-sm transition-colors ${editor.isActive('bulletList') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                • List
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`px-2 py-1.5 rounded-md text-sm transition-colors ${editor.isActive('orderedList') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                1. List
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`px-2 py-1.5 rounded-md text-sm transition-colors ${editor.isActive('blockquote') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                "Quote
            </button>
            <div className="w-px bg-border mx-1 my-1"></div>
            <button
                type="button"
                onClick={setLink}
                className={`px-2 py-1.5 rounded-md text-sm transition-colors ${editor.isActive('link') ? 'bg-primary text-white' : 'hover:bg-gray-200 text-text-secondary'}`}
            >
                Link
            </button>
            <button
                type="button"
                onClick={addImage}
                className={`px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-gray-200 text-text-secondary`}
            >
                Image
            </button>
        </div>
    );
};

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
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
                class: 'prose prose-slate max-w-none min-h-[300px] p-6 focus:outline-none focus:ring-4 focus:ring-primary/10 rounded-b-xl border border-t-0 border-border bg-white',
            },
        },
    });

    return (
        <div className="w-full flex flex-col relative rounded-xl shadow-sm">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
