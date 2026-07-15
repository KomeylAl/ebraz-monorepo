import {
  createPostSchema,
  listPostsQuerySchema,
  updatePostSchema,
  type CreatePostInput,
  type UpdatePostInput,
} from "@ebraz/validation/cms/posts";
import { handleCmsError } from "@/features/cms/domain/cms-error.handler";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { parseQuery } from "@/lib/http/parse-query";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission, withPublic } from "@/lib/http/with-auth";
import {
  createPost,
  deletePost,
  getPostBySlug,
  getPosts,
  getPublicPostBySlug,
  getPublicPosts,
  updatePost,
} from "../application/posts.service";

async function getSlug(context: { params: Promise<Record<string, string>> }) {
  const { slug } = await context.params;
  if (!slug) return error("VALIDATION_ERROR", "Slug is required", 400);
  return slug;
}

export const listPostsHandler = withPermission("cms.read", async (request) => {
  const query = parseQuery(request.nextUrl, listPostsQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getPosts(query));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const listPublicPostsHandler = withPublic(async (request) => {
  const query = parseQuery(request.nextUrl, listPostsQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getPublicPosts(query));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const createPostHandler = withPermission(
  "cms.write",
  async (request: AuthenticatedRequest) => {
    const input = await parseBody<CreatePostInput>(request, createPostSchema);
    if (isErrorResponse(input)) return input;
    try {
      const post = await createPost(input, request.auth.sub, request.auth.sub);
      return success(post, 201);
    } catch (err) {
      return handleCmsError(err);
    }
  },
);

export const getPostHandler = withPermission("cms.read", async (_request, context) => {
  const slug = await getSlug(context);
  if (slug instanceof Response) return slug;
  try {
    return success(await getPostBySlug(slug));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const getPublicPostHandler = withPublic(async (_request, context) => {
  const slug = await getSlug(context);
  if (slug instanceof Response) return slug;
  try {
    return success(await getPublicPostBySlug(slug));
  } catch (err) {
    return handleCmsError(err);
  }
});

export const updatePostHandler = withPermission(
  "cms.write",
  async (request: AuthenticatedRequest, context) => {
    const slug = await getSlug(context);
    if (slug instanceof Response) return slug;
    const input = await parseBody<UpdatePostInput>(request, updatePostSchema);
    if (isErrorResponse(input)) return input;
    try {
      return success(await updatePost(slug, input, request.auth.sub));
    } catch (err) {
      return handleCmsError(err);
    }
  },
);

export const deletePostHandler = withPermission(
  "cms.delete",
  async (request: AuthenticatedRequest, context) => {
    const slug = await getSlug(context);
    if (slug instanceof Response) return slug;
    try {
      await deletePost(slug, request.auth.sub);
      return success({ message: "Post deleted" });
    } catch (err) {
      return handleCmsError(err);
    }
  },
);
