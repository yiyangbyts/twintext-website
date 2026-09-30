"use strict";

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu() {
  navigation?.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', '打开导航菜单');
}
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  navigation?.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.nav')) closeMenu(); });
window.matchMedia('(min-width: 951px)').addEventListener('change', closeMenu);

const lightbox = document.querySelector('.lightbox');
document.querySelectorAll('[data-lightbox]').forEach(button => {
  button.addEventListener('click', () => {
    const image = lightbox?.querySelector('img');
    const caption = lightbox?.querySelector('figcaption');
    if (!lightbox || !image || !caption) return;
    image.src = button.dataset.lightbox;
    image.alt = button.querySelector('img')?.alt || '';
    caption.textContent = button.dataset.caption || image.alt;
    lightbox.showModal();
    document.body.style.overflow = 'hidden';
  });
});
lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
lightbox?.addEventListener('close', () => { document.body.style.overflow = ''; });

const demoPages = document.querySelector('.demo-pages');
const layoutButtons = document.querySelectorAll('[data-reader-layout]');
const layoutStatus = document.querySelector('#layout-status');
layoutButtons.forEach(button => button.addEventListener('click', () => {
  if (!demoPages) return;
  const layout = button.dataset.readerLayout;
  demoPages.dataset.layout = layout;
  layoutButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  if (layoutStatus) layoutStatus.textContent = `${button.querySelector('h3').textContent} · 排列演示`;
}));
const controls = {
  'reader-pane': value => { demoPages.dataset.pane = value; },
  'reader-density': value => { demoPages.dataset.density = value; },
  'reader-font': value => {
    const fonts = { system: 'inherit', serif: '"Songti SC", "Noto Serif SC", serif', sans: '"PingFang SC", "Microsoft YaHei", sans-serif' };
    demoPages.style.setProperty('--reader-font', fonts[value] || fonts.system);
  },
  'reader-size': value => demoPages.style.setProperty('--reader-size', `${Number(value) / 100}rem`),
  'reader-line': value => demoPages.style.setProperty('--reader-line', `${1.8 * Number(value) / 100}`)
};
for (const [id, update] of Object.entries(controls)) {
  const input = document.getElementById(id);
  input?.addEventListener('input', () => {
    if (!demoPages) return;
    update(input.value);
    const output = document.querySelector(`output[for="${id}"]`);
    if (output) output.textContent = `${input.value}%`;
  });
}
document.querySelector('[data-copy-checksum]')?.addEventListener('click', async event => {
  const status = document.querySelector('#copy-status');
  const value = document.querySelector('#download-checksum')?.textContent.trim();
  if (!value || !status) return;
  try {
    await navigator.clipboard.writeText(value);
    status.textContent = 'SHA-256 已复制。';
  } catch {
    status.textContent = '浏览器未允许复制，请选中上方校验值手动复制。';
  }
});
