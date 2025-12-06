import { DOMParser } from '@xmldom/xmldom';
import { formatDate, updateFile } from './lib';
import { BLOG_RSS, WAKATIME_GIST } from './constants';

interface BlogPost {
  title: string;
  link: string;
  pubDate: string;
}

async function fetchAndParseRss(url: string): Promise<BlogPost[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const xmlText = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');

    const items = doc.getElementsByTagName('item');
    const posts: BlogPost[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const titleElement = item.getElementsByTagName('title')[0];
      const linkElement = item.getElementsByTagName('link')[0];
      const pubDateElement = item.getElementsByTagName('pubDate')[0];

      if (titleElement && linkElement && pubDateElement) {
        posts.push({
          title: titleElement.textContent?.trim() || 'No Title',
          link: linkElement.textContent?.trim() || '#',
          pubDate: pubDateElement.textContent?.trim() || '',
        });
      }
    }
    return posts;
  } catch (error) {
    console.error('未能获取 RSS feed:', error);
    return [];
  }
}

export async function generateRecentPostsHtml(): Promise<string> {
  const posts = await fetchAndParseRss(BLOG_RSS);
  const latestSixPosts = posts.slice(0, 6);

  if (latestSixPosts.length === 0) {
    return '<p>未能获取最近的博客文章。</p>';
  }

  const html = latestSixPosts.map(post => {
    const formattedDate = formatDate(post.pubDate, 'YYYY-MM-DD');
    return `<tr>
  <td>
    <a href="${post.link}" target="_blank" rel="noopener noreferrer">${post.title}</a>
  </td>
  <td>${formattedDate}</td>
</tr>`;
  }).join('\n');

  return `<table>\n${html}\n</table>`;
}

export async function fetchWakaTime(): Promise<string> {
  try {
    const response = await fetch(WAKATIME_GIST);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    return data;
  } catch (error) {
    console.error('未能获取 WakaTime 数据:', error);
    return '';
  }
}

export async function update(): Promise<void> {
  try {
    const html_content = await generateRecentPostsHtml();
    const waka_time = await fetchWakaTime();
    const update_at = formatDate(Date.now());

    // 首次更新——从模板到 README 文件
    await updateFile({
      inp: './template.md',
      out: './README.md',
      tag: '<!-- recent-post -->',
      content: html_content
    });

    // 第二次更新 - 从 README 到 README（因为第一次更新已经修改过了）
    await updateFile({
      inp: './README.md',
      out: './README.md',
      tag: '<!-- wakatime -->',
      content: waka_time
    });

    await updateFile({
      inp: './README.md',
      out: './README.md',
      tag: '<!-- update_at -->',
      content: update_at
    });

    console.log('🎆 更新 README 成功');
  } catch (error) {
    console.error('未能更新 README.md:', error);
    throw error;
  }
}

if (import.meta.main) {
  update().catch(error => {
    console.error('未能更新README.md:', error);
    process.exit(1);
  });
}
