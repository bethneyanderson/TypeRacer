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
  if (!seconds) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.round(words / (seconds / 60));
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

function refWordsSlice(count) {
  return referenceText.split(/\s+/).slice(0, count).join(" ");
}

function updateWPM() {
  if (!testActive) return;
  const userInput = inputBox.value;
  const correctWords = getCorrectWordsCount(userInput, referenceText);
  const wpm = calculateWPM(refWordsSlice(correctWords), elapsed);
  wpmDisplay.textContent = `WPM: ${wpm}`;
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
  startTime = Date.now();
  elapsed = 0;
  timeDisplay.textContent = "Time: 0s";
  wpmDisplay.textContent = "WPM: 0";
  testActive = true;
  timerInterval = setInterval(updateTime, 1000);
}

function stopTest() {
  clearInterval(timerInterval);
  updateWPM();
  inputBox.disabled = true;
  testActive = false;
}

function retryTest() {
  stopTest();
  inputBox.value = "";
  inputBox.disabled = false;
  timeDisplay.textContent = "Time: 0s";
  wpmDisplay.textContent = "WPM: 0";
  elapsed = 0;
  testActive = false;
}

function setReferenceText() {
  const level = difficultySelect.value;
  if (level === "medium" || level === "hard") {
    referenceInput.value = referenceTexts[level].join("\n");
  } else {
    referenceInput.value = referenceTexts[level] || "";
  }
  // Resize the box to fit content
  referenceInput.style.height = "auto";
  referenceInput.style.height = referenceInput.scrollHeight + "px";
  // Reset test state
  retryTest();
}

difficultySelect.addEventListener("change", setReferenceText);
startBtn.addEventListener("click", () => {
  if (!testActive) startTest();
});
stopBtn.addEventListener("click", stopTest);
retryBtn.addEventListener("click", retryTest);
inputBox.addEventListener("input", updateWPM);

// On page load, ensure the box fits the default text
referenceInput.style.height = "auto";
referenceInput.style.height = referenceInput.scrollHeight + "px";
