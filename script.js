// دالة لفك تشفير النصوص باستخدام Base64
function decodeBase64(encoded) {
    return atob(encoded);
}

// المعلومات الحساسة مشفرة
const encodedApiKey = 'QUl6YVN5Q3hNQmtiOXFzcWZadVNMUDItODJEM3Ewei1PbEJyTHR4UA==';
const encodedApiUrl = 'aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy9nZW1pbmktcHJvOmdlbmVyYXRlQ29udGVudA==';

// فك تشفير المعلومات الحساسة
const apiKey = decodeBase64(encodedApiKey);
const apiUrl = decodeBase64(encodedApiUrl);

// التحقق من المضيف وتعطيل CSS إذا كان المضيف غير مصرح به
document.addEventListener('DOMContentLoaded', () => {
    const allowedHosts = ['github.io', 'github.com']; // قائمة بالمضيفين المسموح لهم
    const currentHost = window.location.hostname;

    // تحقق من أن المضيف الحالي يحتوي على أي من المضيفين المسموح لهم
    const isAllowedHost = allowedHosts.some(host => currentHost.includes(host));
    
    if (!isAllowedHost) {
        console.error('Unauthorized environment. Disabling styles.');
        // إزالة الرابط المرجعي لملف CSS لتعطيل الأنماط
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => link.remove());
    }

    // بقية الكود الخاص بك
    translationManager = new TranslationManager();
    console.log('Translation manager initialized');
    
    // Add click event listener to translate button
    const translateBtn = document.getElementById('translateBtn');
    if (translateBtn) {
        translateBtn.onclick = () => {
            if (translationManager) {
                translationManager.handleTranslate();
            }
        };
    }

    // Request microphone permission on page load
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.onstart = function() {};
        recognition.start();
        recognition.stop();
    }
});

// Event listener to trigger translation on Ctrl + Enter
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.ctrlKey) {
        translate();
    }
});

// Adding a note about the shortcut in HTML
const controlsContainer = document.querySelector('.controls');
if (controlsContainer) {
    const shortcutNote = document.createElement('p');
    shortcutNote.textContent = 'استخدم Ctrl + Enter لتنفيذ الترجمة';
    shortcutNote.style.color = 'var(--text-light)';
    shortcutNote.style.textAlign = 'center';
    shortcutNote.style.marginTop = '1rem';
    controlsContainer.insertAdjacentElement('beforeend', shortcutNote);
}

// Global functions that will be called from HTML
function translate() {
    if (translationManager) {
        translationManager.handleTranslate();
    }
}

function clearText() {
    if (translationManager) {
        translationManager.handleClear();
    }
}

function showHistory() {
    if (translationManager) {
        translationManager.showHistory();
    }
}

function closeHistory() {
    if (translationManager) {
        translationManager.closeHistory();
    }
}

function clearHistory() {
    if (translationManager) {
        localStorage.removeItem('translationHistory');
        translationManager.translationHistory = [];
        translationManager.showHistory();
    }
}

function updateCharCount(elementId, count) {
    document.getElementById(elementId).textContent = `${count} / 5000`;
}

function showErrorModal(message) {
    const errorModal = document.getElementById('errorModal');
    if (errorModal) {
        const errorMessage = errorModal.querySelector('p');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        errorModal.classList.add('show');
        setTimeout(() => {
            closeErrorModal();
        }, 2000);
    }
}

function closeErrorModal() {
    const errorModal = document.getElementById('errorModal');
    if (errorModal) {
        errorModal.classList.add('fade-out');
        setTimeout(() => {
            errorModal.classList.remove('show');
            errorModal.classList.remove('fade-out');
        }, 300);
    }
}

function copyText(elementId) {
    const textarea = document.getElementById(elementId);
    textarea.select();
    document.execCommand('copy');

    const notification = document.getElementById('copyNotification');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Function to handle speech synthesis
let currentUtterance = null;
let speechSynthesis = window.speechSynthesis;
let voices = [];

function loadVoices() {
    return new Promise((resolve) => {
        let voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            resolve(voices);
        } else {
            speechSynthesis.addEventListener('voiceschanged', () => {
                voices = speechSynthesis.getVoices();
                resolve(voices);
            });
        }
    });
}

function getVoiceForLanguage(lang) {
    const femaleIndicators = ['female', 'woman', 'girl', 'samantha', 'victoria', 'zira', 'monica'];

    let femaleVoice;
    if (lang === 'ar') {
        femaleVoice = voices.find(v => 
            v.lang.startsWith('ar') && 
            femaleIndicators.some(indicator => 
                v.name.toLowerCase().includes(indicator)
            )
        ) || voices.find(v => v.name === "Microsoft Huda Desktop") || voices.find(v => v.lang === 'ar-SA');
    } else if (lang === 'ru') {
        femaleVoice = voices.find(v => 
            v.lang.startsWith('ru') && 
            femaleIndicators.some(indicator => 
                v.name.toLowerCase().includes(indicator)
            )
        ) || voices.find(v => v.name === "Microsoft Irina Desktop") || voices.find(v => v.lang === 'ru-RU');
    } else if (lang === 'en') {
        femaleVoice = voices.find(v => 
            v.lang.startsWith('en') && 
            femaleIndicators.some(indicator => 
                v.name.toLowerCase().includes(indicator)
            )
        ) || voices.find(v => v.name === "Microsoft Zira Desktop") || voices.find(v => v.lang === 'en-UK');
    }

    if (!femaleVoice) {
        femaleVoice = voices.find(v => 
            femaleIndicators.some(indicator => 
                v.name.toLowerCase().includes(indicator)
            )
        );
    }

    console.log('Selected voice:', femaleVoice?.name, 'for language:', lang);
    
    return femaleVoice || voices.find(v => v.lang.startsWith(lang)) || voices[0];
}

async function speakText(elementId) {
    try {
        const text = document.getElementById(elementId).value.trim();
        if (!text) {
            showErrorModal('No text to speech');
            return;
        }

        const button = event.currentTarget;

        if (currentUtterance) {
            speechSynthesis.cancel();
            currentUtterance = null;
            button.classList.remove('speaking');
            button.innerHTML = '<i class="fas fa-volume-up"></i> Listening';
            return;
        }

        if (!voices.length) {
            voices = await loadVoices();
        }

        const lang = elementId === 'inputText' ? 
            translationManager.detectLanguage(text) : 
            translationManager.selectedTargetLang;

        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = getVoiceForLanguage(lang);
        
        utterance.voice = selectedVoice;
        utterance.lang = lang;
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        button.classList.add('speaking');
        button.innerHTML = '<i class="fas fa-stop"></i> Stop';

        utterance.onend = () => {
            button.classList.remove('speaking');
            button.innerHTML = '<i class="fas fa-volume-up"></i> Listening';
            currentUtterance = null;
        };

        utterance.onerror = (event) => {
            console.error('Speech error:', event.error);
            button.classList.remove('speaking');
            button.innerHTML = '<i class="fas fa-volume-up"></i> Listening';
            currentUtterance = null;
            showErrorModal('An error occurred while pronouncing');
        };

        currentUtterance = utterance;
        speechSynthesis.speak(utterance);

    } catch (error) {
        console.error('Speech synthesis error:', error);
        showErrorModal('Error sorry, there is a problem in the pronunciation system');
    }
}

function startRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('متصفحك لا يدعم التعرف على الصوت. يرجى استخدام متصفح مختلف.');
        return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-us';

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('inputText').value = transcript;
        updateCharCount('inputCharCount', transcript.length);
    };

    recognition.onerror = function(event) {
        console.error('حدث خطأ أثناء التعرف على الصوت:', event.error);
    };

    recognition.start();
}

window.addEventListener('beforeunload', () => {
    if (currentUtterance) {
        speechSynthesis.cancel();
    }
});

document.addEventListener('DOMContentLoaded', loadVoices);

// Class to manage translation functionality
class TranslationManager {
    constructor() {
        this.API_KEY = apiKey;
        this.MAX_CHARS = 5000;
        this.MIN_HEIGHT = 100;
        this.GEMINI_API_URL = apiUrl;
        this.SUPPORTED_LANGUAGES = {
            ar: 'Arabic',
            en: 'English',
            ru: 'Русский'
        };
        this.selectedTargetLang = localStorage.getItem('selectedTargetLang') || 'en';
        this.translationHistory = this.loadHistory();
        this.initElements();
        this.initEventListeners();
        this.setupAutoResize();
        this.createLanguageSelector();
    }

    initElements() {
        this.elements = {
            inputText: document.getElementById('inputText'),
            outputText: document.getElementById('outputText'),
            translateBtn: document.getElementById('translateBtn'),
            clearBtn: document.getElementById('clearBtn'),
            copyBtn: document.getElementById('copyBtn'),
            charCount: document.getElementById('outputCharCount'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            progressBar: document.getElementById('progressBar'),
            sourceLangIndicator: document.getElementById('sourceLangIndicator'),
            targetLangIndicator: document.getElementById('targetLangIndicator'),
            examples: document.querySelector('.examples'),
            copyNotification: document.getElementById('copyNotification'),
            historyModal: document.getElementById('historyModal'),
            historyList: document.getElementById('historyList'),
            historyExamples: document.getElementById('historyExamples')
        };
    }

    initEventListeners() {
        if (this.elements.inputText) {
            this.elements.inputText.addEventListener('input', () => this.handleInput());
        }
    }

    setupAutoResize() {
        const resizeTextarea = (textarea) => {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        };

        if (this.elements.inputText) {
            this.elements.inputText.addEventListener('input', () => resizeTextarea(this.elements.inputText));
        }
        if (this.elements.outputText) {
            this.elements.outputText.addEventListener('input', () => resizeTextarea(this.elements.outputText));
        }
    }

    createLanguageSelector() {
        const selector = document.getElementById('targetLanguageSelect');
        if (selector) {
            selector.value = this.selectedTargetLang;
            selector.addEventListener('change', (e) => {
                this.selectedTargetLang = e.target.value;
                localStorage.setItem('selectedTargetLang', this.selectedTargetLang);
            });
        }
    }

    detectLanguage(text) {
        const arabicPattern = /[\u0600-\u06FF]/;
        const russianPattern = /[\u0400-\u04FF]/;
        
        if (arabicPattern.test(text)) return 'ar';
        if (russianPattern.test(text)) return 'ru';
        return 'en';
    }

    async translate(text, sourceLang, targetLang) {
        try {
            const prompt = `Translate the following text from ${this.SUPPORTED_LANGUAGES[sourceLang]} to ${this.SUPPORTED_LANGUAGES[targetLang]}. 
The translation must be completely literal and exact, without any decorative quotes or special characters.
Do not add any quotation marks, angle brackets, or any other symbols at the beginning or end of the translation.
Just provide the plain translated text:

${text}`;
        
            const response = await fetch(`${this.GEMINI_API_URL}?key=${this.API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
        
            const translation = data.candidates[0].content.parts[0].text
                .replace(/^["'«»""]/g, '')
                .replace(/["'«»"""]$/g, '')
                .replace(/[""]/g, '')
                .replace(/[«»]/g, '')
                .trim();

            const verificationPrompt = `Translate the following text from ${this.SUPPORTED_LANGUAGES[targetLang]} to ${this.SUPPORTED_LANGUAGES[sourceLang]}. 
                The translation must be completely literal and exact, without any decorative quotes or special characters.
                Do not add any quotation marks, angle brackets, or any other symbols:

                ${translation}`;
                    
            const verificationResponse = await fetch(`${this.GEMINI_API_URL}?key=${this.API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: verificationPrompt }]
                    }]
                })
            });

            if (!verificationResponse.ok) throw new Error(`HTTP error! status: ${verificationResponse.status}`);
            const verificationData = await verificationResponse.json();
                    
            const backTranslation = verificationData.candidates[0].content.parts[0].text
                .replace(/^["'«»""]/g, '')
                .replace(/["'«»"""]$/g, '')
                .replace(/[""]/g, '')
                .replace(/[«»]/g, '')
                .trim();

            if (this.calculateSimilarity(text, backTranslation) < 0.8) {
                console.warn('Warning: Translation might not be accurate');
            }

            return translation;
        } catch (error) {
            console.error('Translation error:', error);
            throw error;
        }
    }

    calculateSimilarity(text1, text2) {
        const clean1 = text1.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
        const clean2 = text2.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    
        const words1 = clean1.split(/\s+/);
        const words2 = clean2.split(/\s+/);
    
        const commonWords = words1.filter(word => words2.includes(word));
    
        return commonWords.length / Math.max(words1.length, words2.length);
    }

    async handleTranslate() {
        const text = this.elements.inputText?.value?.trim() || '';
        
        if (!text) {
            showErrorModal();
            if (this.elements.outputText) {
                this.elements.outputText.value = '';
            }
            return;
        }

        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = 'flex';
        }
        if (this.elements.translateBtn) {
            this.elements.translateBtn.disabled = true;
        }

        try {
            const sourceLang = this.detectLanguage(text);
            const targetLang = this.selectedTargetLang;

            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 2;
                if (progress > 90) clearInterval(progressInterval);
                if (this.elements.progressBar) {
                    this.elements.progressBar.style.width = `${progress}%`;
                }
            }, 50);

            const translation = await this.translate(text, sourceLang, targetLang);
        
            if (this.elements.outputText) {
                this.elements.outputText.value = translation;
            }
        
            const examples = await this.generateExamples(text, translation, sourceLang, targetLang);
            this.addToHistory(text, translation, sourceLang, targetLang, examples);

            if (this.elements.progressBar) {
                this.elements.progressBar.style.width = '100%';
            }
        } catch (error) {
            console.error('Translation error:', error);
            if (this.elements.outputText) {
                this.elements.outputText.value = 'عذراً، حدث خطأ أثناء الترجمة. يرجى المحاولة مرة أخرى.';
            }
        } finally {
            if (this.elements.loadingOverlay) {
                this.elements.loadingOverlay.style.display = 'none';
            }
            if (this.elements.translateBtn) {
                this.elements.translateBtn.disabled = false;
            }
            if (this.elements.progressBar) {
                this.elements.progressBar.style.width = '0%';
            }
        }
    }

    async generateExamples(text, translation, sourceLang, targetLang) {
        const examplesContainer = document.querySelector('.examples');
        if (!examplesContainer) return [];

        const wordCount = text.split(/\s+/).length;
        if (wordCount > 2) {
            examplesContainer.innerHTML = '<p class="no-examples">لا تتوفر أمثلة لجمل طويلة</p>';
            return [];
        }

        try {
            const prompt = `Generate 3 practical usage examples for the translation pair: "${text}" (${sourceLang}) → "${translation}" (${targetLang}). Format each example as " text | text"`;
            
            const response = await fetch(`${this.GEMINI_API_URL}?key=${this.API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            const examples = data.candidates[0].content.parts[0].text
                .split('\n')
                .filter(line => line.includes('|'))
                .map(example => {
                    const [original, translation] = example.split('|').map(x => x.trim());
                    return { original, translation };
                });

            this.displayExamples(examples);
            return examples;
        } catch (error) {
            console.error('Error generating examples:', error);
            const examplesContainer = document.querySelector('.examples');
            if (examplesContainer) {
                examplesContainer.innerHTML = '<p class="no-examples">عذراً، لم نتمكن من إنشاء أمثلة</p>';
            }
            return [];
        }
    }

    displayExamples(examples) {
        const examplesContainer = document.querySelector('.examples');
        if (!examplesContainer) return;

        const examplesHTML = examples.map((example, index) => `
            <div class="example">
                <div class="example-body">
                    <p class="original-text">
                        <span class="language-label ${translationManager.detectLanguage(example.original)}">
                            ${translationManager.SUPPORTED_LANGUAGES[translationManager.detectLanguage(example.original)]}
                        </span>
                        ${example.original}
                    </p>
                    <p class="translation-text">
                        <span class="language-label ${translationManager.selectedTargetLang}">
                            ${translationManager.SUPPORTED_LANGUAGES[translationManager.selectedTargetLang]}
                        </span>
                        ${example.translation}
                    </p>
                </div>
            </div>
        `).join('');

        examplesContainer.innerHTML = examplesHTML || '<p class="no-examples">لا تتوفر أمثلة</p>';
    }

    handleInput() {
        const text = (this.elements.inputText?.value || '').trim();
        const count = text.length;
        
        if (this.elements.charCount) {
            this.elements.charCount.textContent = `${count} / ${this.MAX_CHARS}`;
        }
        
        if (this.elements.translateBtn) {
            this.elements.translateBtn.disabled = count === 0 || count > this.MAX_CHARS;
        }
    }

    handleClear() {
        if (this.elements.inputText) {
            this.elements.inputText.value = '';
            this.elements.inputText.style.height = `${this.MIN_HEIGHT}px`;
        }
        
        if (this.elements.outputText) {
            this.elements.outputText.value = '';
            this.elements.outputText.style.height = `${this.MIN_HEIGHT}px`;
        }
        
        if (this.elements.examples) {
            this.elements.examples.innerHTML = '';
        }
        
        if (this.elements.translateBtn) {
            this.elements.translateBtn.disabled = true;
        }
        
        if (this.elements.charCount) {
            this.elements.charCount.textContent = `0 / ${this.MAX_CHARS}`;
        }
    }

    loadHistory() {
        return JSON.parse(localStorage.getItem('translationHistory') || '[]');
    }

    addToHistory(source, target, sourceLang, targetLang, examples) {
        const entry = {
            source,
            target,
            sourceLang,
            targetLang,
            examples,
            timestamp: new Date().toISOString()
        };

        this.translationHistory.unshift(entry);
        if (this.translationHistory.length > 10) {
            this.translationHistory.pop();
        }

        localStorage.setItem('translationHistory', JSON.stringify(this.translationHistory));
    }

    loadHistoryItem(historyItem) {
        if (this.elements.inputText && this.elements.outputText) {
            this.elements.inputText.value = historyItem.source;
            this.elements.outputText.value = historyItem.target;
            
            const inputCount = document.getElementById('inputCharCount');
            const outputCount = document.getElementById('outputCharCount');
            if (inputCount) inputCount.textContent = `${historyItem.source.length} / 5000`;
            if (outputCount) outputCount.textContent = `${historyItem.target.length} / 5000`;
            
            this.displayExamples(historyItem.examples || []);
            this.closeHistory();
        }
    }

    showHistory() {
        const historyModal = document.getElementById('historyModal');
        const historyList = document.getElementById('historyList');
        
        if (historyModal && historyList) {
            historyList.innerHTML = this.translationHistory.length > 0 ? 
                this.translationHistory.map(entry => `
                    <div class="history-item">
                        <div class="history-item-header">
                            <span class="history-item-time">${new Date(entry.timestamp).toLocaleString('en')}</span>
                        </div>
                        <div class="history-item-content">
                            <div class="history-item-text">
                                <h4></h4>
                                <p>${entry.source}</p>
                            </div>
                            <div class="history-item-text">
                                <h4</h4>
                                <p>${entry.target}</p>
                            </div>
                        </div>
                        <div class="history-item-actions">
                            <button class="history-item-button load" onclick="translationManager.loadHistoryItem(${JSON.stringify(entry).replace(/"/g, '&quot;')})">
                                <i class="fas fa-sync"></i> Open
                            </button>
                            <button class="history-item-button delete" onclick="translationManager.deleteHistoryItem('${entry.timestamp}')">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                `).join('') :
                `
                <div class="no-history">
                    <i class="fas fa-light fa-clock-rotate-left"></i>
                    <p>You don't have any previous translations history</p>
                </div>
                `;
            historyModal.classList.add('show');
        }
    }

    closeHistory() {
        const historyModal = document.getElementById('historyModal');
        if (historyModal) {
            historyModal.classList.remove('show');
        }
    }

    deleteHistoryItem(timestamp) {
        this.translationHistory = this.translationHistory.filter(entry => entry.timestamp !== timestamp);
        localStorage.setItem('translationHistory', JSON.stringify(this.translationHistory));
        this.showHistory();
    }
}

// Initialize the global instance when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    translationManager = new TranslationManager();
    console.log('Translation manager initialized');
    
    // Add click event listener to translate button
    const translateBtn = document.getElementById('translateBtn');
    if (translateBtn) {
        translateBtn.onclick = () => {
            if (translationManager) {
                translationManager.handleTranslate();
            }
        };
    }

    // Request microphone permission on page load
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.onstart = function() {};
        recognition.start();
        recognition.stop();
    }
});