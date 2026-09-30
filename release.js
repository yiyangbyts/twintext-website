"use strict";

// Zotero reads this same manifest from the add-on's update_url.
const manifestUrl = 'https://raw.githubusercontent.com/yiyangbyts/twintext-releases/main/updates.json';
const addonId = 'twintext@twintext.plugin';
const trustedReleasePrefix = 'https://github.com/yiyangbyts/twintext-releases/releases/download/';
const fallbackVersion = '1.0.1';
const fallbackHash = 'sha256:019739b3124a7ad49c97abf232e789e55bcdb3e075aeb6922e9231f94171b1c8';
const source = document.querySelector('#release-source');

function versionParts(value) {
  return /^\d+\.\d+\.\d+$/.test(value) ? value.split('.').map(Number) : null;
}

function compareVersions(left, right) {
  const a = versionParts(left.version);
  const b = versionParts(right.version);
  for (let index = 0; index < 3; index++) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

function validRelease(entry) {
  if (!entry || !versionParts(entry.version) || !/^sha256:[a-f\d]{64}$/i.test(entry.update_hash || '')) return false;
  try {
    return entry.update_link.startsWith(trustedReleasePrefix)
      && new URL(entry.update_link).protocol === 'https:'
      && entry.applications?.zotero?.strict_min_version
      && entry.applications?.zotero?.strict_max_version;
  } catch { return false; }
}

async function updatePublishedRelease() {
  if (!source) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(manifestUrl, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new Error('Update source unavailable');
    const manifest = await response.json();
    const releases = manifest.addons?.[addonId]?.updates;
    if (!Array.isArray(releases)) throw new Error('Invalid update manifest');
    const latest = releases.filter(validRelease).sort(compareVersions).at(-1);
    if (!latest) throw new Error('No valid release');

    const link = document.querySelector('#latest-download');
    const checksum = document.querySelector('#download-checksum');
    const badge = document.querySelector('#release-badge');
    const compatibility = document.querySelector('#release-compatibility');
    if (!link || !checksum || !badge || !compatibility) return;
    badge.textContent = `${latest.version} · 公开发行`;
    const mirroredLocally = latest.version === fallbackVersion
      && latest.update_hash.toLowerCase() === fallbackHash;
    if (mirroredLocally) {
      link.href = `downloads/twintext-${fallbackVersion}.xpi`;
      link.setAttribute('download', `twintext-${fallbackVersion}.xpi`);
    } else {
      link.href = latest.update_link;
      link.removeAttribute('download');
    }
    link.textContent = `下载公开版 ${latest.version} · .xpi`;
    checksum.textContent = latest.update_hash.slice(7).toLowerCase();
    compatibility.textContent = `兼容声明：Zotero ${latest.applications.zotero.strict_min_version}–${latest.applications.zotero.strict_max_version}`;
    source.textContent = `已与插件公开更新源同步 · ${latest.version}${mirroredLocally ? ' · 本站下载' : ''}`;
  } catch {
    source.textContent = `更新源暂不可达 · 使用已校验的 ${fallbackVersion} 备份包`;
  } finally {
    clearTimeout(timeout);
  }
}

updatePublishedRelease();
