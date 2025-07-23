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
    flashDiv.innerHTML = chapter.flashcards.map((f, i) => `
      <div class="flashcard" onclick="alert('${f.back}')">
        <span class="flashcard-count">${i + 1}/${chapter.flashcards.length}</span>
        ${f.front}
      </div>
    `).join('');
    // Exercises
    const exDiv = document.getElementById('chapter-exercises');
    let exercisesHtml = '';
    if (chapter.exercises && typeof chapter.exercises === 'object' && !Array.isArray(chapter.exercises)) {
        // MCQ
        if (chapter.exercises.mcq && chapter.exercises.mcq.length) {
            exercisesHtml += '<h4 class="font-semibold mt-2">Multiple Choice Questions</h4>';
            chapter.exercises.mcq.forEach((q, i) => {
                exercisesHtml += `<div class="mb-2"><div>${i+1}. ${q.question}</div>`;
                q.options.forEach((opt, j) => {
                    exercisesHtml += `<label class="block"><input type="radio" name="mcq${i}" value="${opt}"> ${opt}</label>`;
                });
                exercisesHtml += `<div class="text-sm text-red-500 mt-1" id="mcq-feedback-${i}"></div></div>`;
            });
        }
        // One Word
        if (chapter.exercises.oneWord && chapter.exercises.oneWord.length) {
            exercisesHtml += '<h4 class="font-semibold mt-4">One Word Answers</h4>';
            chapter.exercises.oneWord.forEach((q, i) => {
                exercisesHtml += `<div class="mb-2">${i+1}. ${q.question}<br><input type="text" class="border rounded px-2 py-1" id="oneword${i}"><div class="text-sm text-red-500 mt-1" id="oneword-feedback-${i}"></div></div>`;
            });
        }
        // Short Answer 1
        if (chapter.exercises.shortAnswer1 && chapter.exercises.shortAnswer1.length) {
            exercisesHtml += '<h4 class="font-semibold mt-4">Short Answer Questions</h4>';
            chapter.exercises.shortAnswer1.forEach((q, i) => {
                exercisesHtml += `<div class="mb-2">${i+1}. ${q.question}<br><textarea class="border rounded px-2 py-1 w-full" rows="2" id="shortanswer1${i}"></textarea><div class="text-sm text-red-500 mt-1" id="shortanswer1-feedback-${i}"></div></div>`;
            });
        }
        // Short Answer 2
        if (chapter.exercises.shortAnswer2 && chapter.exercises.shortAnswer2.length) {
            exercisesHtml += '<h4 class="font-semibold mt-4">Short Answer Questions (2)</h4>';
            chapter.exercises.shortAnswer2.forEach((q, i) => {
                exercisesHtml += `<div class="mb-2">${i+1}. ${q.question}<br><textarea class="border rounded px-2 py-1 w-full" rows="2" id="shortanswer2${i}"></textarea><div class="text-sm text-red-500 mt-1" id="shortanswer2-feedback-${i}"></div></div>`;
            });
        }
        // True/False
        if (chapter.exercises.trueFalse && chapter.exercises.trueFalse.length) {
            exercisesHtml += '<h4 class="font-semibold mt-4">True or False</h4>';
            chapter.exercises.trueFalse.forEach((q, i) => {
                exercisesHtml += `<div class="mb-2">${i+1}. ${q.question}<br>`;
                exercisesHtml += `<label class="mr-2"><input type="radio" name="tf${i}" value="true"> True</label>`;
                exercisesHtml += `<label><input type="radio" name="tf${i}" value="false"> False</label>`;
                exercisesHtml += `<div class="text-sm text-red-500 mt-1" id="tf-feedback-${i}"></div></div>`;
            });
        }
        exercisesHtml += '<button id="check-answers-btn" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Check Answers</button>';
    } else if (Array.isArray(chapter.exercises)) {
        exercisesHtml = '<ul>' + chapter.exercises.map(e => `<li>${e}</li>`).join('') + '</ul>';
    }

    exDiv.innerHTML = exercisesHtml;

    // Long Answer Questions
    const longAnsDiv = document.createElement('div');
    if (chapter.longAnswerQuestions && Array.isArray(chapter.longAnswerQuestions) && chapter.longAnswerQuestions.length) {
        longAnsDiv.innerHTML = '<h4 class="font-semibold mt-6">Long Answer Questions</h4>';
        chapter.longAnswerQuestions.forEach((q, i) => {
            longAnsDiv.innerHTML += `
                <div class="mb-4 p-4 bg-gray-50 rounded shadow">
                    <div class="font-medium mb-2">${i+1}. ${q.title || q.text}</div>
                    <textarea class="border rounded px-2 py-1 w-full mb-2" rows="4" placeholder="Write your answer here..."></textarea>
                    <button class="show-long-answer-btn px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700" data-idx="${i}">Show Answer</button>
                    <div class="long-answer-content mt-2 hidden" id="long-answer-${i}">
                        <div><span class="font-semibold">150 Words:</span> ${q.answer150Words || ''}</div>
                        <div class="mt-1"><span class="font-semibold">200 Words:</span> ${q.answer200Words || ''}</div>
                        <div class="mt-1"><span class="font-semibold">50-75 Words:</span> ${q.answer50To75Words || ''}</div>
                    </div>
                </div>
            `;
        });
        exDiv.appendChild(longAnsDiv);
        // Add event listeners for Show Answer buttons
        longAnsDiv.querySelectorAll('.show-long-answer-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = this.getAttribute('data-idx');
                const ansDiv = longAnsDiv.querySelector(`#long-answer-${idx}`);
                if (ansDiv) ansDiv.classList.toggle('hidden');
                this.textContent = ansDiv.classList.contains('hidden') ? 'Show Answer' : 'Hide Answer';
            });
        });
    }

    // Add answer validation logic
    const answers = {
        mcq: [
            "Management is an intangible force.",
            "Survival, Profit, Growth",
            "Staffing",
            "Middle management"
        ],
        oneWord: [
            "Effectiveness",
            "Efficiency",
            "Coordination",
            "Dynamic"
        ],
        shortAnswer1: [
            "Management is the process of getting things done with the aim of achieving organizational goals effectively and efficiently. It involves a series of interrelated functions like planning, organizing, staffing, directing, and controlling.",
            "Coordination integrates group efforts by unifying diverse interests into purposeful work activity, ensuring a common focus for all organizational members towards shared goals.",
            "Management is considered multidimensional because it involves managing work (translating goals), managing people (dealing with individuals and groups), and managing operations (production process and transformation of inputs to outputs)."
        ],
        shortAnswer2: [
            "Management is pervasive because its activities are common to all organizations, regardless of their nature (economic, social, or political). For example, a hospital, a school, or a business like KnowledgeCompass all require management to achieve their diverse goals, though the specific ways managers perform tasks may differ based on culture or context.",
            "While managers at the top level spend more time in planning and organizing, middle managers are primarily responsible for implementing and controlling plans developed by top management. They also ensure their department has the necessary personnel, assign duties, motivate them, and cooperate with other departments for smooth functioning.",
            "High efficiency combined with low effectiveness means achieving tasks with minimum cost but failing to reach the desired target. For example, a company might produce goods cheaply but not enough to meet market demand, leading to declining sales. This scenario indicates poor management where the business is efficient but not achieving its objectives effectively."
        ],
        trueFalse: [true, false, true, false]
    };
    function normalize(s) {
        return (s||'').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
    }
    exDiv.querySelector('#check-answers-btn')?.addEventListener('click', function() {
        // MCQ
        if (chapter.exercises.mcq) {
            chapter.exercises.mcq.forEach((q, i) => {
                const checked = exDiv.querySelector(`input[name=mcq${i}]:checked`);
                const feedback = exDiv.querySelector(`#mcq-feedback-${i}`);
                if (!checked) {
                    feedback.textContent = 'Please select an answer.';
                    feedback.classList.remove('text-green-600');
                } else if (normalize(checked.value) === normalize(answers.mcq[i])) {
                    feedback.textContent = 'Correct!';
                    feedback.classList.remove('text-red-500');
                    feedback.classList.add('text-green-600');
                } else {
                    feedback.textContent = 'Incorrect.';
                    feedback.classList.remove('text-green-600');
                    feedback.classList.add('text-red-500');
                }
            });
        }
        // One Word
        if (chapter.exercises.oneWord) {
            chapter.exercises.oneWord.forEach((q, i) => {
                const val = exDiv.querySelector(`#oneword${i}`).value;
                const feedback = exDiv.querySelector(`#oneword-feedback-${i}`);
                if (!val) {
                    feedback.textContent = 'Please enter an answer.';
                    feedback.classList.remove('text-green-600');
                } else if (normalize(val) === normalize(answers.oneWord[i])) {
                    feedback.textContent = 'Correct!';
                    feedback.classList.remove('text-red-500');
                    feedback.classList.add('text-green-600');
                } else {
                    feedback.textContent = 'Incorrect.';
                    feedback.classList.remove('text-green-600');
                    feedback.classList.add('text-red-500');
                }
            });
        }
        // Short Answer 1
        if (chapter.exercises.shortAnswer1) {
            chapter.exercises.shortAnswer1.forEach((q, i) => {
                const val = exDiv.querySelector(`#shortanswer1${i}`).value;
                const feedback = exDiv.querySelector(`#shortanswer1-feedback-${i}`);
                if (!val) {
                    feedback.textContent = 'Please enter an answer.';
                    feedback.classList.remove('text-green-600');
                } else if (normalize(val).includes(normalize(answers.shortAnswer1[i]).slice(0, 15))) {
                    feedback.textContent = 'Looks good!';
                    feedback.classList.remove('text-red-500');
                    feedback.classList.add('text-green-600');
                } else {
                    feedback.textContent = 'Check your answer.';
                    feedback.classList.remove('text-green-600');
                    feedback.classList.add('text-red-500');
                }
            });
        }
        // Short Answer 2
        if (chapter.exercises.shortAnswer2) {
            chapter.exercises.shortAnswer2.forEach((q, i) => {
                const val = exDiv.querySelector(`#shortanswer2${i}`).value;
                const feedback = exDiv.querySelector(`#shortanswer2-feedback-${i}`);
                if (!val) {
                    feedback.textContent = 'Please enter an answer.';
                    feedback.classList.remove('text-green-600');
                } else if (normalize(val).includes(normalize(answers.shortAnswer2[i]).slice(0, 15))) {
                    feedback.textContent = 'Looks good!';
                    feedback.classList.remove('text-red-500');
                    feedback.classList.add('text-green-600');
                } else {
                    feedback.textContent = 'Check your answer.';
                    feedback.classList.remove('text-green-600');
                    feedback.classList.add('text-red-500');
                }
            });
        }
        // True/False
        if (chapter.exercises.trueFalse) {
            chapter.exercises.trueFalse.forEach((q, i) => {
                const checked = exDiv.querySelector(`input[name=tf${i}]:checked`);
                const feedback = exDiv.querySelector(`#tf-feedback-${i}`);
                if (!checked) {
                    feedback.textContent = 'Please select True or False.';
                    feedback.classList.remove('text-green-600');
                } else if ((checked.value === 'true') === answers.trueFalse[i]) {
                    feedback.textContent = 'Correct!';
                    feedback.classList.remove('text-red-500');
                    feedback.classList.add('text-green-600');
                } else {
                    feedback.textContent = 'Incorrect.';
                    feedback.classList.remove('text-green-600');
                    feedback.classList.add('text-red-500');
                }
            });
        }
    });
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
