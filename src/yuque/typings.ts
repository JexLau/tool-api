export interface YuqueConfig {
  baseUrl: string;
  token: string;
  dataPath: string;
  userAgent: string;
}

export interface Repo {
  id: number;
  name: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  reposName: string;
  created_at: string;
  description: string;
  cover: string;
  word_count: number;
  read_count: number;
}

export interface UserInfo {
  login: string;
}
