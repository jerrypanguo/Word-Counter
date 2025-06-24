/**
 * 字数统计工具 - 核心功能脚本
 * 支持中英文字数统计，界面始终为中文
 */

class WordCounter {
    constructor() {
        // 获取DOM元素
        this.textInput = document.getElementById('textInput');
        this.totalCount = document.getElementById('totalCount');
        this.wordCount = document.getElementById('wordCount');
        this.punctuationCount = document.getElementById('punctuationCount');
        this.characterCount = document.getElementById('characterCount');
        this.characterNoSpaceCount = document.getElementById('characterNoSpaceCount');
        this.paragraphCount = document.getElementById('paragraphCount');
        this.langSwitch = document.getElementById('langSwitch');
        this.pasteBtn = document.getElementById('pasteBtn');
        this.messageBox = document.getElementById('messageBox');
        this.wordLabel = document.getElementById('wordLabel');
        this.ruleValue = document.getElementById('ruleValue');
        this.rule1 = document.getElementById('rule1');
        this.rule3 = document.getElementById('rule3');
        
        // 当前统计模式
        this.currentMode = 'zh'; // zh: 中文模式, en: 英文模式
        
        // 输入检测相关
        this.lastInputTime = 0;
        this.lastTextLength = 0;
        this.inputBuffer = [];
        this.isTyping = false;
        this.typingTimer = null;
        
        // 初始化
        this.init();
    }

    /**
     * 初始化函数，绑定事件监听器
     */
    init() {
        // 监听文本输入变化，实时统计
        this.textInput.addEventListener('input', (e) => {
            this.handleInput(e);
            this.updateStats();
        });

        // 监听粘贴事件
        this.textInput.addEventListener('paste', (e) => {
            this.handlePaste(e);
            setTimeout(() => {
                this.updateStats();
            }, 10);
        });

        // 监听语言切换
        this.langSwitch.addEventListener('click', () => {
            this.switchMode();
        });

        // 监听粘贴按钮
        this.pasteBtn.addEventListener('click', () => {
            this.pasteText();
        });

        // 初始化界面
        this.updateInterface();
        this.adjustTextareaHeight();
        
        // 页面加载时进行初始统计
        this.updateStats();
    }

    /**
     * 处理输入事件
     */
    handleInput(e) {
        const currentTime = Date.now();
        const currentTextLength = this.textInput.value.length;
        const lengthDiff = Math.abs(currentTextLength - this.lastTextLength);
        const timeDiff = currentTime - this.lastInputTime;

        // 检测输入速度和字符变化量
        if (lengthDiff > 20 && timeDiff < 100) {
            // 大量文字在短时间内出现，可能是粘贴
            this.triggerPasteAnimation();
        } else if (lengthDiff > 0) {
            // 正常输入
            this.handleTyping();
        }

        this.lastInputTime = currentTime;
        this.lastTextLength = currentTextLength;
        
        // 调整高度
        this.adjustTextareaHeight();
    }

    /**
     * 处理粘贴事件
     */
    handlePaste(e) {
        // 延迟触发动画，确保内容已经粘贴
        setTimeout(() => {
            this.triggerPasteAnimation();
            this.adjustTextareaHeight();
        }, 50);
    }

    /**
     * 处理打字输入
     */
    handleTyping() {
        this.isTyping = true;
        this.textInput.classList.add('typing');
        
        // 清除之前的定时器
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
        
        // 设置停止打字的定时器
        this.typingTimer = setTimeout(() => {
            this.isTyping = false;
            this.textInput.classList.remove('typing');
        }, 1000);
    }

    /**
     * 触发粘贴波动动画
     */
    triggerPasteAnimation() {
        // 移除可能存在的其他动画类
        this.textInput.classList.remove('typing', 'wave-line', 'paste-animation');
        
        // 强制重绘
        this.textInput.offsetHeight;
        
        // 添加粘贴动画
        this.textInput.classList.add('paste-animation');
        
        // 动画结束后清除类
        setTimeout(() => {
            this.textInput.classList.remove('paste-animation');
        }, 800);
    }

    /**
     * 调整文本框高度
     */
    adjustTextareaHeight() {
        const minHeight = window.innerWidth <= 480 ? 120 : window.innerWidth <= 768 ? 150 : 200;
        // 移除最大高度限制，允许无限向下扩展
        
        // 重置高度以获取准确的scrollHeight
        this.textInput.style.height = 'auto';
        
        // 计算需要的高度
        const scrollHeight = this.textInput.scrollHeight;
        const padding = 40; // padding top + bottom
        const newHeight = Math.max(minHeight, scrollHeight + padding);
        
        // 设置新高度，无最大高度限制
        this.textInput.style.height = newHeight + 'px';
        
        // 始终隐藏滚动条，因为高度会自动调整
        this.textInput.style.overflowY = 'hidden';
    }

    /**
     * 切换统计模式
     */
    switchMode() {
        this.currentMode = this.currentMode === 'zh' ? 'en' : 'zh';
        this.updateInterface();
        this.updateStats();
        this.showMessage();
    }

    /**
     * 显示消息提示
     */
    showMessage() {
        const modeText = this.currentMode === 'zh' ? '中文统计模式' : '英文统计模式';
        this.messageBox.textContent = `已切换到${modeText}`;
        this.messageBox.classList.add('show');
        
        setTimeout(() => {
            this.messageBox.classList.remove('show');
        }, 2000);
    }

    /**
     * 更新界面显示
     */
    updateInterface() {
        if (this.currentMode === 'zh') {
            // 中文统计模式
            this.langSwitch.textContent = '中';
            this.wordLabel.textContent = '汉字数';
            this.ruleValue.textContent = '每个汉字 + 每个标点符号 = 总字数';
            this.rule1.textContent = '每个中文汉字计为 1 个字数';
            this.rule3.textContent = '英文单词按单词计算';
        } else {
            // 英文统计模式
            this.langSwitch.textContent = '英';
            this.wordLabel.textContent = '单词数';
            this.ruleValue.textContent = '每个单词 + 每个标点符号 = 总字数';
            this.rule1.textContent = '每个英文单词计为 1 个字数';
            this.rule3.textContent = '中文汉字不计入统计';
        }
    }

    /**
     * 统计中文汉字数量
     * @param {string} text - 输入文本
     * @returns {number} 汉字数量
     */
    countChineseCharacters(text) {
        if (!text) return 0;
        
        // 中文汉字正则表达式（包括繁体字）
        const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g;
        const matches = text.match(chineseRegex);
        return matches ? matches.length : 0;
    }

    /**
     * 统计英文单词数量
     * @param {string} text - 输入文本
     * @returns {number} 单词数量
     */
    countEnglishWords(text) {
        if (!text || text.trim() === '') return 0;

        // 移除中文字符和标点符号，只保留英文部分
        const englishText = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, ' ')
                               .replace(/[.!?,:;'"()[\]{}\-–—\/\\@#$%^&*+=<>|~`，。！？；：""''（）【】《》、]/g, ' ');
        
        const words = englishText
            .trim()
            .replace(/\s+/g, ' ')
            .split(/\s+/)
            .filter(word => {
                return /[a-zA-Z0-9]/.test(word);
            });

        return words.length > 0 && words[0] !== '' ? words.length : 0;
    }

    /**
     * 统计总字数（根据统计模式）
     * @param {string} text - 输入文本
     * @returns {number} 总字数
     */
    countTotalWords(text) {
        if (this.currentMode === 'zh') {
            // 中文模式：汉字数 + 英文单词数
            return this.countChineseCharacters(text) + this.countEnglishWords(text);
        } else {
            // 英文模式：只统计英文单词
            return this.countEnglishWords(text);
        }
    }

    /**
     * 统计标点符号数量
     * @param {string} text - 输入文本
     * @returns {number} 标点符号数量
     */
    countPunctuation(text) {
        if (!text) return 0;

        // 包含中英文标点符号的正则表达式
        const punctuationRegex = /[.!?,:;'"()[\]{}\-–—\/\\@#$%^&*+=<>|~`，。！？；：""''（）【】《》、]/g;
        
        const matches = text.match(punctuationRegex);
        return matches ? matches.length : 0;
    }

    /**
     * 统计段落数量
     * @param {string} text - 输入文本
     * @returns {number} 段落数量
     */
    countParagraphs(text) {
        if (!text || text.trim() === '') return 0;

        const paragraphs = text
            .split(/\n+/)
            .filter(paragraph => paragraph.trim() !== '');

        return paragraphs.length;
    }

    /**
     * 统计字符数（含空格）
     * @param {string} text - 输入文本
     * @returns {number} 字符数量
     */
    countCharacters(text) {
        return text ? text.length : 0;
    }

    /**
     * 统计字符数（不含空格）
     * @param {string} text - 输入文本
     * @returns {number} 字符数量（不含空格）
     */
    countCharactersNoSpace(text) {
        if (!text) return 0;
        return text.replace(/\s/g, '').length;
    }

    /**
     * 更新统计数据显示
     */
    updateStats() {
        const text = this.textInput.value;
        
        // 计算各项统计数据
        const totalWords = this.countTotalWords(text);
        const punctuation = this.countPunctuation(text);
        const total = totalWords + punctuation; // 总字数 = 文字数 + 标点符号数
        const characters = this.countCharacters(text);
        const charactersNoSpace = this.countCharactersNoSpace(text);
        const paragraphs = this.countParagraphs(text);

        // 更新DOM显示
        this.animateNumberChange(this.totalCount, total);
        this.animateNumberChange(this.wordCount, totalWords);
        this.animateNumberChange(this.punctuationCount, punctuation);
        this.animateNumberChange(this.characterCount, characters);
        this.animateNumberChange(this.characterNoSpaceCount, charactersNoSpace);
        this.animateNumberChange(this.paragraphCount, paragraphs);

        // 调试信息
        if (window.DEBUG) {
            console.log('统计结果:', {
                统计模式: this.currentMode,
                总字数: total,
                文字数: totalWords,
                标点符号数: punctuation,
                字符数含空格: characters,
                字符数不含空格: charactersNoSpace,
                段落数: paragraphs,
                中文汉字数: this.countChineseCharacters(text),
                英文单词数: this.countEnglishWords(text)
            });
        }
    }

    /**
     * 数字变化动画效果
     * @param {HTMLElement} element - 要更新的DOM元素
     * @param {number} newValue - 新的数值
     */
    animateNumberChange(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;
        
        if (currentValue === newValue) return;

        element.style.transform = 'scale(1.1)';
        element.style.transition = 'transform 0.2s ease';
        
        element.textContent = newValue.toLocaleString();
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }

    /**
     * 获取详细的统计信息
     * @returns {Object} 统计信息对象
     */
    getDetailedStats() {
        const text = this.textInput.value;
        
        return {
            统计模式: this.currentMode,
            原文本: text,
            总字数: this.countTotalWords(text) + this.countPunctuation(text),
            文字数: this.countTotalWords(text),
            中文汉字数: this.countChineseCharacters(text),
            英文单词数: this.countEnglishWords(text),
            标点符号数: this.countPunctuation(text),
            字符数含空格: this.countCharacters(text),
            字符数不含空格: this.countCharactersNoSpace(text),
            段落数: this.countParagraphs(text),
            统计时间: new Date().toLocaleString('zh-CN')
        };
    }

    /**
     * 粘贴剪贴板内容到文本框
     */
    async pasteText() {
        try {
            // 使用现代的 Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                const text = await navigator.clipboard.readText();
                if (text.trim()) {
                    this.textInput.value = text;
                    this.adjustTextareaHeight();
                    this.updateStats();
                    this.triggerPasteAnimation();
                    this.showPasteMessage('内容已粘贴');
                    this.textInput.focus();
                } else {
                    this.showPasteMessage('剪贴板为空', false);
                }
            } else {
                // 降级方案：提示用户手动粘贴
                this.textInput.focus();
                this.showPasteMessage('请使用 Ctrl+V 粘贴', false);
            }
        } catch (err) {
            console.error('粘贴失败:', err);
            this.textInput.focus();
            this.showPasteMessage('请使用 Ctrl+V 粘贴', false);
        }
    }

    /**
     * 显示粘贴状态消息
     */
    showPasteMessage(message, success = true) {
        this.messageBox.textContent = message;
        this.messageBox.style.background = success ? '#fff' : '#fff';
        this.messageBox.style.borderColor = success ? '#000' : '#999';
        this.messageBox.style.color = success ? '#000' : '#666';
        this.messageBox.classList.add('show');
        
        setTimeout(() => {
            this.messageBox.classList.remove('show');
        }, 2000);
    }
}

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', () => {
    const wordCounter = new WordCounter();
    
    window.wordCounter = wordCounter;
    
    // 窗口大小改变时重新调整高度
    window.addEventListener('resize', () => {
        wordCounter.adjustTextareaHeight();
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + L 清空文本
        if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
            event.preventDefault();
            wordCounter.textInput.value = '';
            wordCounter.textInput.focus();
            wordCounter.adjustTextareaHeight();
            wordCounter.updateStats();
        }
        
        // Ctrl/Cmd + E 切换统计模式
        if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
            event.preventDefault();
            wordCounter.switchMode();
        }
        
        // Ctrl/Cmd + Shift + V 粘贴文本
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
            event.preventDefault();
            wordCounter.pasteText();
        }
    });

    // 示例文本功能
    const addExampleButton = () => {
        const exampleTexts = {
            zh: `这是一个中文字数统计的示例文本。它包含了中文汉字、英文单词和各种标点符号！

我们来测试一下混合文本的统计效果：Hello world! 这样的混合文本应该能够正确统计。

Does it work correctly? 当然可以！`,
            en: `This is a sample text for testing the word counting functionality. 

It includes multiple sentences, punctuation marks, and paragraphs. Let's see how accurately it counts words and punctuation marks according to essay writing standards.

Does it work correctly? Yes, it should!`
        };
        
        wordCounter.textInput.value = exampleTexts[wordCounter.currentMode];
        wordCounter.updateStats();
        wordCounter.adjustTextareaHeight();
        wordCounter.textInput.focus();
    };

    window.addExample = addExampleButton;
    
    console.log('字数统计工具已加载完成！');
    console.log('快捷键：Ctrl/Cmd + L 清空文本，Ctrl/Cmd + E 切换统计模式，Ctrl/Cmd + Shift + V 粘贴文本');
    console.log('调用 addExample() 添加示例文本');
    console.log('尝试粘贴大段文字体验气泡动画效果！');
    console.log('输入框现在支持无限向下扩展，不再有高度限制！');
    console.log('点击粘贴按钮可以直接粘贴剪贴板内容！');
}); 