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

async function bootstrap () {
    // ------------------   Database    ------------------
    let orm = await MikroORM.init(mikroConfig);

    // autorun migration
    await orm.getMigrator().up();

    // ------------------   Express    ------------------
    let app = express();

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
    
    // Cho phép chuyền em vào các resolvers
    let context = () => ({ em: orm.em })

    let serverGraphQL = new ApolloServer({ schema, context });
    // serverGrapQL.start(); chưa hiểu nguyên nhân có cũng được không có cũng được
    serverGraphQL.applyMiddleware({ app });

    // ------------------   Run   ------------------
    app.listen(4000, () => {
        console.log(colors.green(`[+] Start server port ${4000}`));
    })
}

bootstrap();