// Loads content from content.json and renders the selected chapter
async function loadChapter(chapterId) {
    const res = await fetch('content.json');
    const data = await res.json();
    const chapter = data.chapters.find(c => c.id === chapterId);
    if (!chapter) return;
    document.getElementById('chapter-title').textContent = chapter.title;
    // Story
    const storyDiv = document.getElementById('chapter-story');
    storyDiv.innerHTML = chapter.story.map(s => `<p><strong>${s.title}:</strong> ${s.text}</p>`).join('');
    // Mindmap
    const mindmapDiv = document.getElementById('chapter-mindmap');
    mindmapDiv.innerHTML = chapter.mindmap.map(m => `
        <details>
            <summary>${m.title}</summary>
            <ul>${m.points.map(p => `<li>${p}</li>`).join('')}</ul>
        </details>
    `).join('');
    // Flashcards
    const flashDiv = document.getElementById('chapter-flashcards');
    flashDiv.innerHTML = chapter.flashcards.map(f => `<div class="flashcard" onclick="alert('${f.back}')">${f.front}</div>`).join('');
    // Exercises
    const exDiv = document.getElementById('chapter-exercises');
    exDiv.innerHTML = '<ul>' + chapter.exercises.map(e => `<li>${e}</li>`).join('') + '</ul>';
}

// Navigation
function setupChapterNav() {
    document.querySelectorAll('.chapter-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            loadChapter(this.dataset.chapter);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupChapterNav();
    // Get chapter from URL (?chapter=chapter2)
    const params = new URLSearchParams(window.location.search);
    const chapterId = params.get('chapter') || 'chapter1';
    loadChapter(chapterId);
});
