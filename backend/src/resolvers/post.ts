import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Query, Resolver, Int, Mutation } from "type-graphql";

@Resolver()
export class PostResolvers { 
    @Query(() => [Post])
    posts(@Ctx() context: MyContext): Promise<Post[]> {
        return context.em.find(Post, {});
    }

    @Query(() => Post, { nullable: true })
    post(
        @Ctx() context: MyContext,
        @Arg('id', () => Int) id: number
    ): Promise<Post | null> {
        return context.em.findOne(Post, { id });
    }

    @Mutation(() => Post)
    async createPost(
        @Arg('title', () => String) title: string,
        @Ctx() context: MyContext
    ): Promise<Post>{
        let post = context.em.create(Post, { title })
        await context.em.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Ctx() context: MyContext,
        @Arg('id', () => Int) id: number,
        @Arg('title', () => String, { nullable: true }) title: string
    ): Promise<Post | null> {
        let post = await context.em.findOne(Post, { id });
        if(!post) {
            return null;
        }
        if(title) {
            post.title = title;
            await context.em.persistAndFlush(post);
        }
        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Ctx() context: MyContext,
        @Arg('id', () => Int) id: number
    ): Promise<boolean> {
        await context.em.nativeDelete(Post, { id });
        return true;
    }
}