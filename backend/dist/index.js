"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const colors_1 = __importDefault(require("colors"));
const core_1 = require("@mikro-orm/core");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const post_1 = require("./resolvers/post");
const hello_1 = require("./resolvers/hello");
const user_1 = require("./resolvers/user");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        let orm = yield core_1.MikroORM.init(mikro_orm_config_1.default);
        yield orm.getMigrator().up();
        let app = express_1.default();
        app.get('/', (_, res) => {
            res.send("/grapql");
        });
        let schema = yield type_graphql_1.buildSchema({
            resolvers: [
                hello_1.HelloResolver,
                post_1.PostResolvers,
                user_1.UserResolvers
            ],
            validate: false
        });
        let context = () => ({ em: orm.em });
        let serverGraphQL = new apollo_server_express_1.ApolloServer({ schema, context });
        serverGraphQL.applyMiddleware({ app });
        app.listen(4000, () => {
            console.log(colors_1.default.green(`[+] Start server port ${4000}`));
        });
    });
}
bootstrap();
//# sourceMappingURL=index.js.map