export type PostStatus = "draft" | "published" | "archived";

export interface CategoryProfile {
  id: string;
  name: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TagProfile {
  id: string;
  name: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostAuthorSummary {
  id: string;
  name: string;
}

export interface PostCategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface PostTagSummary {
  id: string;
  name: string;
  slug: string;
}

export interface PostProfile {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  thumbnail?: string;
  status: PostStatus;
  publishedAt?: string;
  author: PostAuthorSummary;
  category?: PostCategorySummary;
  tags: PostTagSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface PostPublicProfile {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  thumbnail?: string;
  publishedAt?: string;
  category?: PostCategorySummary;
  tags: PostTagSummary[];
}

export interface DepartmentProfile {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  thumbnail?: string;
  therapistIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentPublicProfile {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  thumbnail?: string;
}

export interface AboutProfile {
  id: string;
  title: string;
  about: string;
  address: string;
  phones: string;
  mobilePhones: string;
  logoPath: string;
  lat: string;
  longitude: string;
  createdAt: string;
  updatedAt: string;
}
