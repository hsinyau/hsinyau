interface UpdaterConfig {
  inp: string;
  out: string;
  content: string;
  tag: string;
}

export async function updateFile(config: UpdaterConfig): Promise<void> {
  try {
    // 读取文件内容
    const fileContent = await Bun.file(config.inp).text();

    // 查找标签位置
    const tagIndex = fileContent.indexOf(config.tag);
    
    if (tagIndex === -1) {
      throw new Error(`在文件中找不到标签: ${config.tag}`);
    }
    
    // 替换标签为内容
    const beforeTag = fileContent.substring(0, tagIndex);
    const afterTag = fileContent.substring(tagIndex + config.tag.length);
    
    await Bun.write(config.out, `${beforeTag}${config.content}${afterTag}`);
  } catch (error) {
    console.error('更新文件时出错:', error);
    throw error;
  }
}
