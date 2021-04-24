import 'reflect-metadata';
import colors from 'colors';
// database
import { MikroORM } from "@mikro-orm/core";
import mikroConfig from './mikro-orm.config'; 
// server
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
// Resolve
import { PostResolvers } from "./resolvers/post";
import { HelloResolver } from "./resolvers/hello";
import { UserResolvers } from './resolvers/user';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { __prod__ } from './constants';
import { MyContext } from './types';


async function bootstrap () {
    // ------------------   Database    ------------------
    let orm = await MikroORM.init(mikroConfig);

    // autorun migration
    await orm.getMigrator().up();

    // ------------------   Express    ------------------
    let app = express();

    let RedisStore = connectRedis(session);
    let redisClient = redis.createClient();

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({
                client: redisClient,
                // touch: Thể hiện user đã có session nhưng không làm gì để thay đổi dữ liệu 
                //      -> Điều này giúp session sống nếu session không thay đổi thường xuyên 
                // disableTouch: Không cho session sống quá lâu
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true,
                sameSite: 'lax', // csrf
                secure: __prod__// cookie chạy duy nhất trên https
            },
            saveUninitialized: false,
            secret: '889s0dfuye7gfqwzncbg8f6',
            resave: false
        })
    )

    app.get('/', (_, res) => {
        res.send("/grapql");
    })

    // ------------------    Graphql   ------------------
    //  build TypeGraphQL executable schema
    let schema = await buildSchema({
        resolvers: [
            HelloResolver,
            PostResolvers,
            UserResolvers
        ],
        validate: false
    })
    
    let serverGraphQL = new ApolloServer({ 
        schema, 
        // Cho phép chuyền em vào các resolvers
        context: ({ req, res }): MyContext => {
            return ({ em: orm.em, req, res }) 
        }
    });
    // serverGrapQL.start(); chưa hiểu nguyên nhân có cũng được không có cũng được
    serverGraphQL.applyMiddleware({ app });

    // ------------------   Run   ------------------
    app.listen(4000, () => {
        console.log(colors.green(`[+] Start server port ${4000}`));
    })
}

bootstrap();