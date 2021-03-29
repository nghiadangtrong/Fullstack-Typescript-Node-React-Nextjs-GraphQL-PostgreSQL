import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Mutation, Resolver, Ctx, Arg, InputType, Field, ObjectType } from "type-graphql";
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
    @Field(() => String)
    username: string;

    @Field(() => String)
    password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolvers {

    @Mutation(() => UserResponse)
    async register(
        @Ctx() { em }: MyContext,
        @Arg('options') options: UsernamePasswordInput
    ): Promise<UserResponse> {
        if (options.username.trim().length < 5) {
            return {
                errors: [ { field: 'username', message: 'length must be greater than 5' } ]
            }
        } 

        if(options.password.trim().length < 8) {
            return {
                errors: [ { field: 'password', message: 'length must be greater than 8'} ]
            }
        }

        try {
            options.password = await argon2.hash(options.password); 

            let user = em.create(User, options)
            await em.persistAndFlush(user); 
            return {user};
        } catch(err) {
            if (err.code === "23505") {
                return {
                    errors: [
                        {
                        field: "username",
                        message: "username already taken",
                        },
                    ],
                };
            } else {
                console.log('error unknow: ', err)
                return {
                    errors: [
                        { field: 'unknow', message: 'hidden'}
                    ]
                }
            }
        } 
    }

    @Mutation(() => UserResponse)
    async login(
        @Ctx() context: MyContext,
        @Arg('options') options: UsernamePasswordInput
    ): Promise<UserResponse> {
        let user = await context.em.findOne(User, { username: options.username });
        console.log(user);
        if(!user) {
            return {
                errors: [{ field: 'username', message: "that username doesn't exist" }]
            }
        }
        
        let verify = await argon2.verify(user.password, options.password); 
        if(!verify) {
            return {
                errors: [{ field: 'passoword', message: 'incorrect password'}]
            }
        }

        return { user };
    }
}