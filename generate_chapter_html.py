import sys
import json
import shutil
import os

TEMPLATE_FILE = 'chapter1.html'
CONTENT_JSON = 'content.json'

CHAPTER_HTML_TEMPLATE = 'chapter{num}.html'

# Usage: python generate_chapter_html.py chapter2.json 2

def merge_chapter_to_content(chapter_json_path, chapter_num):
    # Load the new chapter JSON
    with open(chapter_json_path, 'r', encoding='utf-8') as f:
        new_chapter = json.load(f)
    # Ensure id is set
    new_chapter['id'] = f'chapter{chapter_num}'
    # Load content.json
    with open(CONTENT_JSON, 'r', encoding='utf-8') as f:
        content = json.load(f)
    # Remove any existing chapter with same id
    content['chapters'] = [ch for ch in content.get('chapters', []) if ch.get('id') != new_chapter['id']]
    # Append new chapter
    content['chapters'].append(new_chapter)
    # Save back
    with open(CONTENT_JSON, 'w', encoding='utf-8') as f:
        json.dump(content, f, ensure_ascii=False, indent=2)
    print(f"Merged {chapter_json_path} as chapter{chapter_num} into {CONTENT_JSON}")

def generate_chapter_html(chapter_num):
    new_html = CHAPTER_HTML_TEMPLATE.format(num=chapter_num)
    shutil.copyfile(TEMPLATE_FILE, new_html)
    # Patch the JS to use the correct chapter id
    with open(new_html, 'r', encoding='utf-8') as f:
        html = f.read()
    html = html.replace(
        "chapterData = data.chapters.find(function(ch) { return ch.id === 'chapter1'; });",
        f"chapterData = data.chapters.find(function(ch) {{ return ch.id === 'chapter{chapter_num}'; }});"
    )
    # Optionally update <title> and heading
    html = html.replace(
        '<title>Chapter 1: Nature and Significance of Management</title>',
        f'<title>Chapter {chapter_num}</title>'
    )
    with open(new_html, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Created {new_html} for chapter {chapter_num}")

def main():
    if len(sys.argv) != 3:
        print("Usage: python generate_chapter_html.py <chapter_json> <chapter_number>")
        sys.exit(1)
    chapter_json = sys.argv[1]
    chapter_num = sys.argv[2]
    merge_chapter_to_content(chapter_json, chapter_num)
    generate_chapter_html(chapter_num)

if __name__ == '__main__':
    main()
