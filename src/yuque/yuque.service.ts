// src/yuque/yuque.service.ts

import { Injectable } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import wretch, { WretchResponse } from 'wretch';
import { YuqueConfig, UserInfo, Repo, Article } from './typings';

@Injectable()
export class YuqueService {
  async exportDocs(config: YuqueConfig): Promise<void> {
    try {
      const userInfo = await this.getUserInfo(config);
      const reposList = await this.getReposData(config, userInfo.login);
      for (const repo of reposList) {
        console.log(`开始导出 ${repo.name} 仓库`, repo.name);
        if (repo.name !== '码农录') {
          continue;
        }
        const articles = await this.getArticleData(config, repo.id, repo.name);
        for (const article of articles) {
          // 判断一下, 如果目录下已经存在同名文件, 则不再导出
          const sanitizedReposName = article.reposName.replace(/\./g, '_');
          const filePath = join(
            config.dataPath,
            sanitizedReposName,
            `${article.title}.md`,
          );
          if (existsSync(filePath)) {
            console.log(`[${article.title} 已经存在, 跳过`);
            continue;
          }
          const content = await this.getArticleContent(
            config,
            repo.id,
            article,
          );
          const fomatContent =
            `---
title: ${article.title}
description: ${article.description}
pubDate: ${article.created_at}
${article.cover ? `heroImage: ${article.cover}` : undefined}
---
` +
            '' +
            content;
          await this.saveArticle(
            config.dataPath,
            article.reposName,
            article.title,
            fomatContent,
          ).catch((error) => {
            console.error(error, '导出失败', article.title);
          });
        }
      }
    } catch (error) {
      console.error('导出过程中出现错误:', error);
      throw new Error('导出过程中出现错误');
    }
  }

  private async getUserInfo(config: YuqueConfig): Promise<UserInfo> {
    const response = (await wretch(`${config.baseUrl}/user`, {
      headers: this.buildHeaders(config),
    })
      .get()
      .json()) as {
      data: UserInfo;
    };
    return response.data;
  }

  private async getReposData(
    config: YuqueConfig,
    login: string,
  ): Promise<Repo[]> {
    const response = (await wretch(`${config.baseUrl}/users/${login}/repos`)
      .headers(this.buildHeaders(config))
      .get()
      .json()) as WretchResponse;
    return response.data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
    }));
  }

  private async getArticleData(
    config: YuqueConfig,
    repoId: number,
    reposName: string,
  ): Promise<Article[]> {
    const response = (await wretch(`${config.baseUrl}/repos/${repoId}/docs`, {
      headers: this.buildHeaders(config),
    })
      .get()
      .json()) as WretchResponse;
    return response.data.map((article: any) => ({
      id: article.id,
      title: article.title, // 标题
      slug: article.slug, // 路径
      description: article.description, // 描述
      cover: article.cover, // 封面
      created_at: article.created_at, // 创建时间
      word_count: article.word_count, // 字数
      read_count: article.read_count, // 阅读数
      reposName,
    }));
  }

  private async getArticleContent(
    config: YuqueConfig,
    bookId: number,
    article: Article,
  ): Promise<string> {
    const response = (await wretch(
      `${config.baseUrl}/repos/${bookId}/docs/${article.id}`,
      {
        headers: this.buildHeaders(config),
      },
    )
      .get()
      .json()) as WretchResponse;
    const content = response.data.body;
    return content.replace(/\\n/g, '\n').replace(/<a name="(.*)"><\/a>/g, '');
  }

  private async saveArticle(
    dataPath: string,
    reposName: string,
    title: string,
    content: string,
  ): Promise<void> {
    const sanitizedReposName = reposName.replace(/\./g, '_');
    const sanitizedTitle = title.replace(/\//g, '_');
    const dirPath = join(dataPath, sanitizedReposName);
    const filePath = join(dirPath, `${sanitizedTitle}.md`);

    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }

    await writeFile(filePath, content, 'utf-8');
    console.log(`[${new Date().toISOString()}] ${title} 导出完成`);
  }

  private buildHeaders(config: YuqueConfig): Record<string, string> {
    return {
      'User-Agent': config.userAgent,
      'X-Auth-Token': config.token,
    };
  }
}
