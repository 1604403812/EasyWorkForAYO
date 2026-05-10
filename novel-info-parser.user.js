// ==UserScript==
// @name         Novel Info Parser
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  解析网页小说信息并提供复制功能
// @match        *://*/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      *
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    const NOVEL_DATA = {
        "novelId": "6947226",
        "url": "https://wap.jjwxc.net/book2/6947226",
        "plat": 1,
        "name": "重生真少爷开始养生以后",
        "author": {
            "id": 161,
            "name": "听原"
        },
        "cover": "https://img12.360buyimg.com/ddimg/jfs/t1/175516/19/45603/80233/66319848F0d4cd9bd/f06bdedf028715e1.jpg",
        "desc": "真的假不了",
        "info": "<div id=\"novelintro\" itemprop=\"description\">预收《我死去的初恋杀回来了》求收藏啦！<br/>推荐朋友完结文《反派重生后被死对头攻略了》，另一位朋友的最新连载文《我与草原书》大家多多支持收藏哦，感谢~文案放下面了～<br/>作为被抱错的豪门真少爷，陈默一直不太懂为什么明明被弄丢在外十七年的人是他，所有人喜欢的还是那个假少爷杨舒乐，所以他拼了命去争，去夺，去抢。<br/>到头来却是父母厌弃，众叛亲离，自己也意外惨死。<br/><br/>所以重生之后，陈默想开了。<br/>笑笑十年少，早睡才能活到老。<br/><br/>回家不久，亲生父母问他："陈默，你看你弟弟……现在能不能还是和我们住在一起？"><br/>陈默真心说："你们开心就好。"<br/><br/>七大姑八大姨逢年过节夸假少爷。<br/>陈默喝着枸杞泡红枣水，连连点头："对对，你们真有眼光。"<br/>周围人明里暗里拿他俩比较，嘲讽他一点都配不上豪门真少爷的身份。<br/>陈默泡着脚睡得七荤八素："这不是事实嘛，尽管说，拿着喇叭出去马路上喊都行。"<br/>其他人："……"<br/><br/>后来人们发现这个豪门捡回的真少爷最擅长三件事。<br/>吃饭睡觉，以及搞同性恋。<br/><br/>他不仅搞同性恋，他还把人假少爷青梅竹马的那个年级第一给翘了。<br/>陈默觉得无比冤枉。<br/>席司宴那个冷脸阎王上辈子就不待见自己，这些人从哪里看出他把人给翘了的。<br/><br/>"要不我替你解释解释？"某天陈默试探道。<br/>靠着墙的人垂眸看着他，扬眉："解释什么？"<br/>"你席司宴这辈子，下辈子，下下辈子，都跟我陈默不会有半毛钱关系。"<br/><br/>面前的人插着兜亲下来，冷淡："现在有了。"<br/>陈默震惊；席司宴！狗逼害我！！<br/><br/>——<br/>《反派重生后被死对头攻略了》<br/>徐野是个反派。<br/>他十八岁被徐家以私生子身份带回，本以为自己从此飞黄腾达，结果不过是被利用的炮灰。<br/>后来，为吞掉徐家所有财产，他坏事做尽，不惜走上绝路。<br/>融兴大厦的顶楼里，他和死对头梁顾川两两对峙，在爆声中一起化为灰烬。<br/>算计一生，他终究没落下好下场。<br/><br/>重活一世，徐野决定不要再做反派了，这次他甘心做一个老实的炮灰，不争不抢。<br/>他的死对头梁顾川学成回国那天，家族举办接风派对。<br/>众人拿他和梁顾川对比，冷嘲热讽："正牌少爷和冒牌少爷的面子就是不一样。"<br/>徐野对此充耳不闻。<br/>谁料，身后传来一声："但不管怎么样都是少爷。"<br/>徐野转头，看见梁顾川目光灼灼地看着自己。<br/><br/>后来，有人发现本来应该是死对头的徐野和梁顾川关系处得其乐融融。期待已久的家族财产争夺战并未出现。<br/>而徐野未曾想到，上一世和自己针锋相对的死对头梁顾川，此刻埋在他的肩膀喘着粗气，声音低沉地喊他的名字："小野，今晚别走了。"<br/><br/>——<br/>《我与草原书》<br/>白兰即篇：<br/>白兰即这一生一直都在失去。<br/>她选择了太子，于是承担了太子的命运。<br/>她想保护皇后，于是甘愿被禁锢。<br/>白家世代忠良，所以她也为此倾覆。<br/><br/>草原风冷，长日苦痛，白兰即蜷缩着慢慢苟活。<br/>好在仇恨养人，而皇后死了，不必看见她的卑劣之路、昭昭野心。<br/>她吃了很多苦，杀了很多人，终于辗转回到中原。<br/>朝中盛传她扶持幼帝，把控朝政，是有称帝之心。<br/>白兰即在朝圣殿上大放厥词：我是郡主的时候，喜欢谁谁就是皇帝，我为皇后时，想立谁谁就是太子。我不必当皇帝，我这一生，决定的都是皇帝的命。<br/><br/>无人知道，她斡旋百官、威逼诸侯时，想起的却是很多年前，一个固执的多管闲事、反复向她伸出手、把她拉回人间的人。<br/><br/>"菩疑，后来的很多年我都在后悔，那时候和亲，我逃到小木屋，你问我要不要跟你回家时，我要是答应了，就好了。"<br/><br/>菩疑篇：<br/>菩疑床前挂了一张私画，女将军的背影英姿煞爽，扶风剑血滴如线。<br/>她曾端掉北地十六部，捅穿潜北腹地，成为无数人的眼中钉，菩疑亦将她视为一生之敌，想与之一较高低。<br/><br/>她是英明在外的坤定侯，他是跟她齐名的混账头。<br/><br/>史册上有迹可循的第一面，却因为她的眼泪手足无措，忍不住问，是谁送你和亲，比我混帐。<br/><br/>*<br/>菩疑喜欢奔腾的动物，笔直锋利的箭，草原永不停歇的风。<br/>他原本也以为自己不会变，自由比生命更重烈。<br/>直到他有了更喜欢的人，比喜欢他的箭还要喜欢，比喜欢草原还要喜欢。<br/><br/>尽管他问：<br/>"如果你不是白兰即，当年在潜北边界的木屋里，我问你要不要跟我回家，你会答应吗？"<br/>尽管她说："可惜我是。"<br/><br/>*<br/>菩疑知道，她爱小皇帝胜过他，她爱将士们胜过他，她爱万万百姓、农田水利都胜过他。<br/><br/>可是那些信还是一封又一封送向三千三百里外的宫殿。<br/><br/>——北地的风吹不到中原。阿鲁娜又生了小羊羔，你怎么还不来给它取名字？<br/><br/>*<br/>殿下是很多人的殿下。<br/>没关系，他们都不敢为此赴死。</div>",
        "wordCount": "400659",
        "tag": [
            {"label": "校园", "value": 12},
            {"label": "轻松", "value": 23},
            {"label": "豪门世家", "value": 27},
            {"label": "重生", "value": 28},
            {"label": "情有独钟", "value": 34}
        ],
        "newTag": [],
        "publish_datetime": "2024-05-12 15:35:43",
        "process": 0
    };

    function addStyles() {
        GM_addStyle(`
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
            .novel-modal-cover {
                width: 120px;
                height: 160px;
                object-fit: cover;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
            .novel-btn-copy-all {
                background: linear-gradient(135deg, #4776e6, #8e54e9);
                color: white;
            }
            .novel-btn-copy-all:hover {
                background: linear-gradient(135deg, #3a62d1, #7a44cc);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(71, 118, 230, 0.4);
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

    function formatCopyText(data) {
        return JSON.stringify(data, null, 2);
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

    function createModal() {
        const overlay = document.createElement('div');
        overlay.className = 'novel-modal-overlay';
        overlay.id = 'novel-info-modal';

        const tagsHtml = NOVEL_DATA.tag.map(t =>
            `<span class="novel-tag">${t.label}</span>`
        ).join('');

        const infoHtml = NOVEL_DATA.info.replace(/<[^>]+>/g, '').substring(0, 500) + '...';

        overlay.innerHTML = `
            <div class="novel-modal">
                <button class="novel-modal-close" id="novel-modal-close-btn">×</button>
                <div class="novel-modal-header">
                    <img class="novel-modal-cover" src="${NOVEL_DATA.cover}" alt="封面" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22160%22><rect fill=%22%23ddd%22 width=%22120%22 height=%22160%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22>封面</text></svg>'">
                    <h2 class="novel-modal-title">${NOVEL_DATA.name}</h2>
                    <p style="color: #7f8c8d; margin: 0;">作者: ${NOVEL_DATA.author.name}</p>
                </div>
                <div class="novel-modal-content">
                    <div class="novel-info-section">
                        <div class="novel-info-label">小说ID</div>
                        <div class="novel-info-value">${NOVEL_DATA.novelId}</div>
                    </div>
                    <div class="novel-info-section">
                        <div class="novel-info-label">链接</div>
                        <div class="novel-info-value"><a href="${NOVEL_DATA.url}" target="_blank" style="color: #4776e6;">${NOVEL_DATA.url}</a></div>
                    </div>
                    <div class="novel-info-section">
                        <div class="novel-info-label">简介</div>
                        <div class="novel-info-value">${NOVEL_DATA.desc || '暂无'}</div>
                    </div>
                    <div class="novel-info-section">
                        <div class="novel-info-label">标签</div>
                        <div class="novel-tags">${tagsHtml || '<span style="color: #999;">暂无标签</span>'}</div>
                    </div>
                    <div class="novel-info-section">
                        <div class="novel-info-label">字数</div>
                        <div class="novel-info-value">${parseInt(NOVEL_DATA.wordCount).toLocaleString()} 字</div>
                    </div>
                    <div class="novel-info-section">
                        <div class="novel-info-label">发布时间</div>
                        <div class="novel-info-value">${NOVEL_DATA.publish_datetime}</div>
                    </div>
                    <div class="novel-info-section">
                        <div class="novel-info-label">详细内容预览</div>
                        <div class="novel-desc">${infoHtml}</div>
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
            copyToClipboard(formatCopyText(NOVEL_DATA));
        });
    }

    function init() {
        addStyles();
        setTimeout(createModal, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
