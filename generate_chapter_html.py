
import sys
import json
import shutil
import os
import re

TEMPLATE_FILE = 'chapter1.html'
CONTENT_JSON = 'content.json'
UNITS_MD = 'units.md'
INDEX_HTML = 'index.html'
CHAPTER_HTML_TEMPLATE = 'chapter{num}.html'

def extract_unit_metadata(unit_num):
    # Parse units.md for the given unit number
    with open(UNITS_MD, 'r', encoding='utf-8') as f:
        text = f.read()
    # Find all units
    matches = re.findall(r'Unit (\d+): ([^\n]+)', text)
    for num, name in matches:
        if int(num) == int(unit_num):
            return {
                'unitNumber': int(num),
                'unitName': name.strip(),
                'title': name.strip()
            }
    raise ValueError(f"Unit {unit_num} not found in {UNITS_MD}")

def patch_chapter_json(chapter_json_path, chapter_num):
    meta = extract_unit_metadata(chapter_num)
    with open(chapter_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    # Patch metadata at the right place
    if 'chapters' in data and isinstance(data['chapters'], list) and data['chapters']:
        chapter = data['chapters'][0]
        chapter['id'] = f'chapter{chapter_num}'
        chapter['unitNumber'] = meta['unitNumber']
        chapter['unitName'] = meta['unitName']
        chapter['title'] = meta['title']
    else:
        raise ValueError('Invalid chapter JSON structure')
    with open(chapter_json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Patched {chapter_json_path} with metadata for unit {chapter_num}")

def generate_chapter_html(chapter_num):
    new_html = CHAPTER_HTML_TEMPLATE.format(num=chapter_num)
    shutil.copyfile(TEMPLATE_FILE, new_html)
    # Patch fetches to use chapterX.json
    with open(new_html, 'r', encoding='utf-8') as f:
        html = f.read()
    html = re.sub(r"fetch\(['\"]content\\.json['\"]\)", f"fetch('chapter{chapter_num}.json')", html)
    html = re.sub(r'Fetching content\\.json', f'Fetching chapter{chapter_num}.json', html)
    html = re.sub(r'content\\.json fetched successfully', f'chapter{chapter_num}.json fetched successfully', html)
    html = re.sub(r'Parsing content\\.json and searching for chapter1', f'Parsing chapter{chapter_num}.json and searching for chapter{chapter_num}', html)
    html = re.sub(r'content\\.json does not contain a \\"chapters\\" array', f'chapter{chapter_num}.json does not contain a "chapters" array', html)
    html = re.sub(r'chapter1 not found in content\\.json', f'chapter{chapter_num} not found in chapter{chapter_num}.json', html)
    html = re.sub(r'chapter1 found. Rendering sections', f'chapter{chapter_num} found. Rendering sections', html)
    html = re.sub(r'<title>Chapter [^<]*</title>', f'<title>Chapter {chapter_num}</title>', html)
    with open(new_html, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Created {new_html} for chapter {chapter_num}")

def update_index_html(chapter_num):
    # Add or update link to chapterX.html in index.html
    with open(INDEX_HTML, 'r', encoding='utf-8') as f:
        html = f.read()
    chapter_link = f'chapter{chapter_num}.html'
    # Try to find the right place to insert (replace or add)
    unit_pattern = re.compile(r'(Unit\s*%s: [^<]+</a>)' % chapter_num)
    if chapter_link in html:
        print(f"index.html already links to {chapter_link}")
        return
    # Find the correct unit line and insert the link
    match = re.search(r'(href=["\"])chapter\d+\.html(["\"])>(Unit %s: [^<]+)</a>' % chapter_num, html)
    if match:
        # Already present
        print(f"index.html already has link for chapter {chapter_num}")
        return
    # Otherwise, try to insert after previous chapter or at the end of the unit list
    # Find the Part A or B section
    part_a = re.search(r'(Part A[\s\S]+?)(</div>)', html)
    if part_a:
        # Insert after last chapter link in Part A
        insert_pos = part_a.end(1)
        html = html[:insert_pos] + f'\n<a href="{chapter_link}" class="block px-4 py-2 hover:bg-blue-100">Unit {chapter_num}: (Auto-added)</a>' + html[insert_pos:]
    else:
        # Fallback: append at end
        html += f'\n<a href="{chapter_link}" class="block px-4 py-2 hover:bg-blue-100">Unit {chapter_num}: (Auto-added)</a>'
    with open(INDEX_HTML, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Updated index.html with link to {chapter_link}")

def merge_chapter_to_content(chapter_json_path, chapter_num):
    # Load the new chapter JSON
    with open(chapter_json_path, 'r', encoding='utf-8') as f:
        new_chapter_data = json.load(f)
    new_chapter = new_chapter_data['chapters'][0]
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

def main():
    if len(sys.argv) != 3:
        print("Usage: python generate_chapter_html.py <chapter_json> <chapter_number>")
        sys.exit(1)
    chapter_json = sys.argv[1]
    chapter_num = int(sys.argv[2])
    patch_chapter_json(chapter_json, chapter_num)
    generate_chapter_html(chapter_num)
    update_index_html(chapter_num)
    merge_chapter_to_content(chapter_json, chapter_num)
    print("All steps completed.")

if __name__ == '__main__':
    main()
