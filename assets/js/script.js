// Typing test logic
const referenceTexts = {
  easy: "The cat sat on the mat",
  medium: [
    "To be or not to be, that is the question.",
    "All that glitters is not gold.",
    "A journey of a thousand miles begins with a single step.",
  ],
  hard: [
    "It was the best of times, it was the worst of times.",
    "In the beginning God created the heavens and the earth.",
    "The only thing we have to fear is fear itself.",
  ],
};
const difficultySelect = document.getElementById("difficulty-select");
const referenceInput = document.querySelector(
  ".form-control.form-control-lg[readonly], textarea.form-control.form-control-lg[readonly]"
);

const inputBox = document.querySelector(
  ".form-control.form-control-lg[placeholder]"
);
const buttons = document.querySelectorAll(".d-flex button");
const [startBtn, stopBtn, retryBtn] = buttons;
const wpmDisplay = document.querySelector(".p-4.mb-4 div div:last-child");
const timeDisplay = document.querySelector(".p-4.mb-4 div div:nth-child(2)");

let startTime = null;
let timerInterval = null;
let elapsed = 0;
let testActive = false;

function calculateWPM(text, seconds) {
  // WPM should increment by 1 for each correct word typed, regardless of time
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return words;
}

function getCorrectWordsCount(input, reference) {
  const inputWords = input.trim().split(/\s+/);
  const refWords = reference.trim().split(/\s+/);
  let correct = 0;
  for (let i = 0; i < inputWords.length; i++) {
    if (inputWords[i] === refWords[i]) correct++;
    else break;
  }
  return correct;
}

function updateWPM() {
  // Always calculate WPM based on user input and reference text, even if test is not active
  const userInput = inputBox.value;
  const referenceText = referenceInput.value;
  const correctWords = getCorrectWordsCount(userInput, referenceText);
  // Only calculate WPM if elapsed > 0, otherwise show 0
  let wpm = 0;
  if (elapsed > 0) {
    wpm = calculateWPM(refWordsSlice(correctWords, referenceText), elapsed);
    if (!isFinite(wpm) || isNaN(wpm)) wpm = 0;
  }
  wpmDisplay.textContent = `WPM: ${wpm}`;
}

// Helper: get correct slice of reference text for WPM calculation
function refWordsSlice(count, referenceText) {
  return referenceText.split(/\s+/).slice(0, count).join(" ");
}

function updateTime() {
  elapsed = Math.floor((Date.now() - startTime) / 1000);
  timeDisplay.textContent = `Time: ${elapsed}s`;
  updateWPM();
}

function startTest() {
  inputBox.value = "";
  inputBox.disabled = false;
  inputBox.focus();
  elapsed = 0;
  timeDisplay.textContent = "Time: 0s";
  wpmDisplay.textContent = "WPM: 0";
  testActive = true;
  // Do NOT start timer here. Timer will start on first input.
  timerInterval = null;
}

// Start timer on first input
function startTimerIfNeeded() {
  if (testActive && !timerInterval) {
    startTime = Date.now();
    timerInterval = setInterval(updateTime, 1000);
  }
}

inputBox.addEventListener("input", function (e) {
  startTimerIfNeeded();
  updateHighlight();
  updateWPM();
});

function stopTest() {
  clearInterval(timerInterval);
  updateWPM();
  inputBox.disabled = true;
  testActive = false;
}

function retryTest() {
  // Reset all test state and allow a new test to start
  clearInterval(timerInterval);
  timerInterval = null;
  startTime = null;
  elapsed = 0;
  testActive = false;
  inputBox.value = "";
  inputBox.disabled = false;
  timeDisplay.textContent = "Time: 0s";
  wpmDisplay.textContent = "WPM: 0";
  inputBox.focus();
}

function setReferenceText() {
  const level = difficultySelect.value;
  if (level === "medium" || level === "hard") {
    referenceInput.value = referenceTexts[level].join("\n");
  } else if (level === "easy") {
    referenceInput.value = referenceTexts.easy;
  } else {
    referenceInput.value = "";
  }
  // Resize the box to fit content
  referenceInput.style.height = "auto";
  referenceInput.style.height = referenceInput.scrollHeight + "px";
  // Reset test state
  retryTest();
}

// --- Real-time Highlighting for Typing Accuracy ---
// Create a div for live highlighting above the input box (only once)
let highlightDiv = document.getElementById("highlighted-text-div");
if (!highlightDiv) {
  highlightDiv = document.createElement("div");
  highlightDiv.id = "highlighted-text-div";
  highlightDiv.className = "highlighted-text mb-2";
  // Insert above the input box
  inputBox.parentNode.parentNode.insertBefore(
    highlightDiv,
    inputBox.parentNode
  );
}

function updateHighlight() {
  const referenceText = referenceInput.value;
  const userInput = inputBox.value;
  const refWords = referenceText.split(/\s+/);
  const inputWords = userInput.split(/\s+/);
  let highlighted = "";
  for (let i = 0; i < refWords.length; i++) {
    if (inputWords[i] === undefined || inputWords[i] === "") {
      highlighted += `<span>${refWords[i]}</span> `;
    } else if (inputWords[i] === refWords[i]) {
      highlighted += `<span class='correct-word'>${refWords[i]}</span> `;
    } else {
      highlighted += `<span class='incorrect-word'>${refWords[i]}</span> `;
    }
  }
  highlightDiv.innerHTML = highlighted.trim();
}

inputBox.addEventListener("input", updateHighlight);

function resetHighlight() {
  const referenceText = referenceInput.value;
  const refWords = referenceText.split(/\s+/);
  let highlighted = refWords.map((w) => `<span>${w}</span>`).join(" ");
  highlightDiv.innerHTML = highlighted;
}

// Patch setReferenceText and retryTest to also reset highlight
const originalSetReferenceText = setReferenceText;
setReferenceText = function () {
  originalSetReferenceText.apply(this, arguments);
  resetHighlight();
};
const originalRetryTest = retryTest;
retryTest = function () {
  originalRetryTest.apply(this, arguments);
  resetHighlight();
};

difficultySelect.addEventListener("change", setReferenceText);
startBtn.addEventListener("click", () => {
  if (!testActive) startTest();
});
stopBtn.addEventListener("click", stopTest);
retryBtn.addEventListener("click", retryTest);
inputBox.addEventListener("input", updateWPM);

// On page load, ensure the box fits the default text and easy message is shown
window.addEventListener("DOMContentLoaded", () => {
  difficultySelect.value = "easy";
  referenceInput.value = referenceTexts.easy;
  referenceInput.style.height = "auto";
  referenceInput.style.height = referenceInput.scrollHeight + "px";
  resetHighlight();
  retryTest();
});
