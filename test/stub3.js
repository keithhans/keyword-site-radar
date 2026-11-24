// 测试页 3：假的 web.cafe 列表页（结构照真实页面：main 里一张卡片一个 a[href^="/keywords/"]）+ chrome.storage.local
(() => {
  const card = (kw, dir, tags, verdict, gpts, desc) =>
    `<a href="/keywords/${kw.replace(/ /g, '-')}?tab=x"><div><span>${kw}</span><span>${dir}</span>${tags.map((t) => `<span>${t}</span>`).join('')}</div>` +
    `<p>${desc}</p><span>${verdict}</span><span>做内页 ·</span><div><span>GPTs</span><span>×${gpts}</span></div><span>3</span><span>12</span></a>`;
  const PAGES = {
    evergreen: [
      [card('jpg to pdf', '工具', ['老词'], '可以试试', 2776.5, 'JPG 转 PDF 是一种在线工具，可将图片转换为 PDF'), card('free ai', 'AI', ['老词'], '值得做', 94.6, '免费的AI人工智能工具与服务，覆盖聊天机器人'), card('lagos life', '游戏', ['二次爆火', '回落中'], '可以试试', 460, 'Lagos Life是一款免费的浏览器生活模拟游戏')],
      [card('lanterns', '其它', ['二次爆火', '回落中'], '可以试试', 262.2, 'HBO 在 2026 年推出的 DC 超级英雄剧集《Lanterns》'), card('pdf to jpg', '工具', ['老词'], '可以试试', 1394.5, 'PDF 转 JPG 工具，可将 PDF 文件的每一页转换')],
    ],
    resurgence: [
      [card('caretakers roblox', '游戏', ['二次爆火', '上升中'], '可以试试', 0.024, '这是一款 Roblox 平台上的恐怖游戏《CareTakers》'), card('lagos life', '游戏', ['二次爆火', '回落中'], '可以试试', 460, 'Lagos Life是一款免费的浏览器生活模拟游戏')],
    ],
  };
  const FOUND = { evergreen: 5, resurgence: 2 };
  // 2026-11 改版后的结构：每行一个 <li>，详情链接是空的覆盖层，关键词在 aria-label 里，
  // 分页是「跳到 [ ] / N 页」。用来验新解析规则。
  const NEW = {
    evergreen: [
      [{ kw: 'pdf to jpg', dir: '工具', tags: ['老词', '上升中'], verdict: '可以试试', gpts: 8.4, desc: 'PDF 转 JPG 工具，可将每一页转换成图片' },
        { kw: 'free ai', dir: 'AI', tags: ['新词'], verdict: '值得做', gpts: 94.6, desc: '免费的 AI 人工智能工具与服务，覆盖聊天机器人' }],
      [{ kw: 'lagos life', dir: '游戏', tags: ['二次爆火', '回落中'], verdict: '可以试试', gpts: 460, desc: 'Lagos Life 是一款免费的浏览器生活模拟游戏' }],
    ],
    resurgence: [
      [{ kw: 'caretakers roblox', dir: '游戏', tags: ['二次爆火', '上升中'], verdict: '可以试试', gpts: 0.024, desc: '这是一款 Roblox 平台上的恐怖游戏' }],
      [{ kw: 'lanterns', dir: '其它', tags: ['二次爆火', '回落中'], verdict: '可以试试', gpts: 262.2, desc: 'HBO 推出的 DC 超级英雄剧集' }],
    ],
  };
  const newCard = (x) => `<li><div>
    <a href="/keywords/${x.kw.replace(/ /g, '-')}?tab=x" aria-label="查看关键词 ${x.kw}" class="absolute inset-0"></a>
    <div><span>${x.kw}</span><button aria-label="复制关键词 ${x.kw}">复制</button>
      <span>${x.dir}</span>${x.tags.map((t) => `<span>${t}</span>`).join('')}<span>${x.verdict}</span>
      <div><span>GPTs </span><b>×${x.gpts}</b></div>
      <div><span>内页候选 </span><b>12</b></div>
      <div>${x.desc}</div></div>
  </div></li>`;
  window.__wcCalls = 0;
  window.__wcLoggedOut = false;
  window.__wcNewMarkup = false;
  window.__wcLocked = false;
  const prevFetch = window.fetch;
  window.fetch = async (u, opts) => {
    const url = new URL(u, location.href);
    if (url.hostname !== 'new.web.cafe') return prevFetch(u, opts);
    window.__wcCalls++;
    const tab = url.searchParams.get('tab'), page = +url.searchParams.get('page');
    let body;
    if (window.__wcLoggedOut) body = '<main><p>请先登录</p></main>';
    else if (window.__wcLocked) body = '<main><p>还没有解锁任何月份的数据</p><p>解锁之后就能看</p></main>';
    else if (window.__wcNewMarkup) {
      const pages = NEW[tab] || [[]];
      const rows = pages[page - 1] || [];
      const total = pages.flat().length;
      body = `<main><div>找到 ${total} 个</div><ul>${rows.map(newCard).join('')}</ul>
        <nav>跳到 <input name="page" max="${pages.length}"> / ${pages.length} 页</nav></main>`;
    } else {
      const pages = PAGES[tab];
      body = `<main><div>找到 ${FOUND[tab]} 个</div>${pages[page - 1].join('')}<div>第 ${page} / ${pages.length} 页</div></main>`;
    }
    return { ok: true, status: 200, text: async () => `<html><body>${body}</body></html>` };
  };
  const store = {};
  chrome.storage = { local: { get: async (k) => ({ [k]: store[k] }), set: async (o) => Object.assign(store, o), remove: async (k) => { delete store[k]; } } };
  window.__wcStore = store;
})();
