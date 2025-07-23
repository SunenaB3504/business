// Story Modal with TTS and speaker highlighting
const speakerStyles = {
    "Neil": "color: #0ea5e9; font-weight: bold; background: #e0f2fe; border-radius: 8px; padding: 0.5rem 1rem; margin-bottom: 0.3rem;",
    "Kanishq": "color: #fbbf24; font-weight: bold; background: #fef9c3; border-radius: 8px; padding: 0.5rem 1rem; margin-bottom: 0.3rem;",
    "Narrator": "color: #64748b; font-style: italic; background: #f1f5f9; border-radius: 8px; padding: 0.5rem 1rem; margin-bottom: 0.3rem;",
    "System": "border-left: 5px solid #f87171; padding-left: 12px; background: #fff0f0; font-weight: bold; border-radius: 8px; margin-bottom: 0.3rem;"
};

const speakerVoicePrefs = {
    "Neil": { pitch: 1.2, rate: 1.05 },
    "Kanishq": { pitch: 0.95, rate: 1.1 },
    "Narrator": { pitch: 1, rate: 0.95 },
    "System": { pitch: 1, rate: 1, volume: 1 }
};

let storySegments = [];
let currentSegment = 0;
let isPlaying = false;
let synth = window.speechSynthesis;
let utter;

function openStoryModal(segments) {
    storySegments = segments;
    currentSegment = 0;
    isPlaying = false;
    document.getElementById('story-modal-content').innerHTML = renderStorySegments(segments);
    document.getElementById('story-modal').style.display = 'flex';
    highlightSegment(0);
    resetControls();
}

function closeStoryModal() {
    stopStory();
    document.getElementById('story-modal').style.display = 'none';
}

function renderStorySegments(segments) {
    return segments.map((seg, i) => {
        let style = speakerStyles[seg.speaker] || '';
        let avatar = '';
        if (seg.speaker === 'Neil') avatar = '<span style="display:inline-block;width:28px;height:28px;background:#38bdf8;border-radius:50%;margin-right:0.7rem;vertical-align:middle;"></span>';
        else if (seg.speaker === 'Kanishq') avatar = '<span style="display:inline-block;width:28px;height:28px;background:#fbbf24;border-radius:50%;margin-right:0.7rem;vertical-align:middle;"></span>';
        else if (seg.speaker === 'Narrator') avatar = '<span style="display:inline-block;width:28px;height:28px;background:#64748b;border-radius:50%;margin-right:0.7rem;vertical-align:middle;"></span>';
        else if (seg.speaker === 'System') avatar = '<span style="display:inline-block;width:28px;height:28px;background:#f87171;border-radius:50%;margin-right:0.7rem;vertical-align:middle;"></span>';
        let sysClass = seg.speaker === 'System' ? 'story-system' : '';
        return `<div class="story-segment ${sysClass}" id="story-segment-${i}" style="display:flex;align-items:flex-start;gap:0.5rem;${style}">`
            + avatar
            + `<div><span style='font-size:1.05em;'>${seg.speaker}:</span> <span style='font-weight:400;'>${seg.text}</span></div>`
            + `</div>`;
    }).join('');
}

function highlightSegment(idx) {
    storySegments.forEach((_, i) => {
        const el = document.getElementById(`story-segment-${i}`);
        if (el) el.style.background = i === idx ? '#e0f2fe' : '';
    });
    // Scroll into view
    const el = document.getElementById(`story-segment-${idx}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function playStory() {
    if (isPlaying) return;
    if (synth.paused) {
        synth.resume();
        isPlaying = true;
        resetControls();
        return;
    }
    // If we paused in the middle of a segment, continue from where we left off
    if (currentSegment < storySegments.length && document.getElementById(`story-segment-${currentSegment}`)) {
        isPlaying = true;
        resetControls();
        // Do not call playSegment again, just resume
        return;
    }
    isPlaying = true;
    resetControls();
    playSegment(currentSegment);
}

function playSegment(idx) {
    if (idx >= storySegments.length) {
        stopStory();
        return;
    }
    currentSegment = idx;
    highlightSegment(idx);
    const seg = storySegments[idx];
    utter = new SpeechSynthesisUtterance(seg.text);
    const prefs = speakerVoicePrefs[seg.speaker] || {};
    Object.assign(utter, prefs);
    utter.onend = () => {
        if (isPlaying && !synth.paused) playSegment(idx + 1);
    };
    utter.onerror = stopStory;
    synth.speak(utter);
}

function pauseStory() {
    if (!isPlaying || synth.paused) return;
    synth.pause();
    isPlaying = false;
    resetControls();
}

function stopStory() {
    synth.cancel();
    isPlaying = false;
    currentSegment = 0;
    highlightSegment(0);
    resetControls();
}

function resetControls() {
    document.getElementById('story-play').disabled = isPlaying && !synth.paused;
    document.getElementById('story-pause').disabled = !isPlaying || synth.paused;
    document.getElementById('story-stop').disabled = !isPlaying && currentSegment === 0 && !synth.paused;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('story-close').onclick = closeStoryModal;
    document.getElementById('story-play').onclick = playStory;
    document.getElementById('story-pause').onclick = pauseStory;
    document.getElementById('story-stop').onclick = stopStory;
});

// To use: openStoryModal([{speaker: 'Neil', text: 'Hello!'}, ...])
