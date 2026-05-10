// ==UserScript==
// @name         Novel Info Parser
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  解析网页小说信息并提供复制功能
// @match        *://xn--pxtr7m.net/*
// @match        *://sosad.net/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    function addStyles() {
        GM_addStyle(`
            .novel-float-btn {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                border: none;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                font-size: 20px;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
                z-index: 999998;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            .novel-float-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
            }
            .novel-float-btn svg {
                width: 24px;
                height: 24px;
            }
            .novel-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                z-index: 999999;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .novel-modal {
                background: linear-gradient(145deg, #ffffff, #f5f5f5);
                border-radius: 16px;
                padding: 24px;
                max-width: 600px;
                width: 90%;
                max-height: 85vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                position: relative;
                animation: modalSlideIn 0.3s ease-out;
            }
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .novel-modal-close {
                position: absolute;
                top: 12px;
                right: 12px;
                width: 32px;
                height: 32px;
                border: none;
                background: #ff4757;
                color: white;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            .novel-modal-close:hover {
                background: #ff3344;
                transform: scale(1.1);
            }
            .novel-modal-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 2px solid #e0e0e0;
            }
            .novel-modal-title {
                font-size: 22px;
                font-weight: 700;
                color: #2c3e50;
                margin: 0 0 8px 0;
            }
            .novel-info-section {
                margin-bottom: 16px;
                padding: 12px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 8px;
            }
            .novel-info-label {
                font-size: 13px;
                color: #7f8c8d;
                margin-bottom: 4px;
                font-weight: 600;
            }
            .novel-info-value {
                font-size: 15px;
                color: #2c3e50;
                word-break: break-word;
            }
            .novel-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            .novel-tag {
                padding: 4px 10px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
            }
            .novel-desc {
                max-height: 150px;
                overflow-y: auto;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.6;
                color: #34495e;
            }
            .novel-buttons {
                display: grid;
                grid-template-columns: 1fr;
                gap: 10px;
                margin-top: 20px;
            }
            .novel-btn {
                padding: 12px 16px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }
            .novel-btn-copy {
                background: linear-gradient(135deg, #11998e, #38ef7d);
                color: white;
            }
            .novel-btn-copy:hover {
                background: linear-gradient(135deg, #0e8a7a, #2dd66a);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(17, 153, 142, 0.4);
            }
            .novel-toast {
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #11998e, #38ef7d);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                z-index: 1000001;
                animation: toastFade 2s ease-out forwards;
            }
            @keyframes toastFade {
                0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
                15% { opacity: 1; transform: translateX(-50%) translateY(0); }
                85% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
        `);
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'novel-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    function parseSosadThread(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const novelIdMatch = window.location.pathname.match(/\/threads\/(\d+)/);
        const novelId = novelIdMatch ? novelIdMatch[1] : '';

        const url = window.location.href.split('#')[0];

        const nameEl = doc.querySelector('a.font-1');
        const name = nameEl ? nameEl.textContent.trim() : '';

        const authorEl = doc.querySelector('span.majia');
        const authorName = authorEl ? authorEl.textContent.trim() : '';

        const descEl = doc.querySelector('.article-title .h5');
        const desc = descEl ? descEl.textContent.trim() : '';

        const infoEl = doc.querySelector('.main-text.text-center.no-selection');
        const info = infoEl ? infoEl.innerHTML.trim() : '';

        const tagLinks = doc.querySelectorAll('a[href*="/tag/"]');
        const tag = [];
        tagLinks.forEach(link => {
            const label = link.getAttribute('title') || link.textContent.trim();
            if (label && !tag.find(t => t.label === label)) {
                tag.push({ label: label, value: 0 });
            }
        });

        let publish_datetime = '';
        let wordCount = 0;
        const table = doc.querySelector('table.table');
        if (table) {
            const tbody = table.querySelector('tbody');
            if (tbody) {
                const rows = tbody.querySelectorAll('tr');
                if (rows.length > 0) {
                    const firstRow = rows[0];
                    const cells = firstRow.querySelectorAll('th, td');
                    if (cells.length >= 4) {
                        publish_datetime = cells[3].textContent.trim();
                    }
                }
                rows.forEach(row => {
                    const cells = row.querySelectorAll('th, td');
                    if (cells.length >= 3) {
                        const wordText = cells[2].textContent.trim();
                        const wordNum = parseInt(wordText) || 0;
                        wordCount += wordNum;
                    }
                });
            }
        }

        return {
            novelId: novelId,
            url: url,
            plat: 0,
            name: name,
            author: {
                id: 0,
                name: authorName
            },
            cover: '',
            desc: desc,
            info: info,
            wordCount: wordCount.toString(),
            tag: tag,
            newTag: [],
            publish_datetime: publish_datetime,
            process: 0
        };
    }

    function copyToClipboard(text) {
        if (typeof GM_setClipboard !== 'undefined') {
            GM_setClipboard(text);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        showToast('JSON数据已复制到剪贴板');
    }

    function createFloatButton() {
        const btn = document.createElement('button');
        btn.className = 'novel-float-btn';
        btn.id = 'novel-float-btn';
        btn.title = '提取小说信息';
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
        `;
        document.body.appendChild(btn);

        btn.addEventListener('click', () => {
            const novelData = parseSosadThread(document.documentElement.outerHTML);
            if (novelData.name) {
                createModal(novelData);
            } else {
                showToast('未检测到小说信息');
            }
        });
    }

    function createModal(novelData) {
        const existingModal = document.getElementById('novel-info-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'novel-modal-overlay';
        overlay.id = 'novel-info-modal';

        const tagsHtml = novelData.tag.map(t =>
            `<span class="novel-tag">${t.label}</span>`
        ).join('');

        const infoPreview = novelData.info.replace(/<[^>]+>/g, '').substring(0, 500) + '...';

        overlay.innerHTML = `
            <div class="novel-modal">
                <button class="novel-modal-close" id="novel-modal-close-btn">×</button>
                <div class="novel-modal-header">
                    <h2 class="novel-modal-title">${novelData.name}</h2>
                    <p style="color: #7f8c8d; margin: 0;">作者: ${novelData.author.name}</p>
                </div>
                <div class="novel-modal-content">
                    <div class="novel-info-section">
                        <div class="novel-info-label">小说ID</div>
                        <div class="novel-info-value">${novelData.novelId}</div>
                    </div>
                    <div class="novel-info-section">
                        <div class="novel-info-label">链接</div>
                        <div class="novel-info-value"><a href="${novelData.url}" target="_blank" style="color: #4776e6;">${novelData.url}</a></div>
                    </div>
                    <div class="novel-info-section">
                        <div class="novel-info-label">简介</div>
                        <div class="novel-info-value">${novelData.desc || '暂无'}</div>
                    </div>
                    <div class="novel-info-section">
                        <div class="novel-info-label">标签</div>
                        <div class="novel-tags">${tagsHtml || '<span style="color: #999;">暂无标签</span>'}</div>
                    </div>
                    <div class="novel-info-section">
                        <div class="novel-info-label">字数</div>
                        <div class="novel-info-value">${parseInt(novelData.wordCount).toLocaleString()} 字</div>
                    </div>
                    <div class="novel-info-section">
                        <div class="novel-info-label">发布时间</div>
                        <div class="novel-info-value">${novelData.publish_datetime || '未知'}</div>
                    </div>
                    <div class="novel-info-section">
                        <div class="novel-info-label">详细内容预览</div>
                        <div class="novel-desc">${infoPreview}</div>
                    </div>
                </div>
                <div class="novel-buttons">
                    <button class="novel-btn novel-btn-copy" id="novel-copy-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        复制JSON信息
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        document.getElementById('novel-modal-close-btn').addEventListener('click', () => {
            overlay.remove();
        });

        document.getElementById('novel-copy-btn').addEventListener('click', () => {
            copyToClipboard(JSON.stringify(novelData, null, 2));
        });
    }

    function init() {
        addStyles();
        createFloatButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
