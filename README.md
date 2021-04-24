## Technology

**Backend**

[] Typescript
    [Parameters<Type>](https://www.typescriptlang.org/docs/handbook/utility-types.html#parameterstype)
[] Nodejs
[] GrapQL
    [Basic](https://www.howtographql.com/choose/)
[] [URQL/Apollo](https://www.apollographql.com/docs/)
[] PostgreSQL
[] MikroORM/TypeORM
[] Redis
[] Docker

**Run Docker**

```bash
docker-composer up // chạy docker 

docker-composer down // Tắt docker
```

**Frontend**

[] React
[] Nextjs
[] TypeGraphQL

## Setup

### Backend

**Run**

```bash
yarn watch && yarn dev
```

#### Config basic

```bash
npm init -y

yarn add \n 
    @types/node \n
    typescript

yarn add -D \n
    ts-node     # Chạy file ts trực tiếp
    nodemon     # restart server khi có sự thay đổi

npx tsconfig.ts     # config typescript
```

**backend/package.json**

```json
    ...
    "scripts": {
        // Dịch ra file js rồi chạy file js
        // Phải chạy đồng thời 2 lệnh: Dịch ra file js + chạy file js
        "watch": "tsc --watch",     // dịch ra file js -> dist/*.js
        "dev": "nodemon dist/index.js",
        "start": "node dist/index.js",
        // Chạy trực tiếp file ts thông qua ts-node
        "dev2": "nodemon --exec ts-node src/index.ts",
        "start2": "ts-node src/index.ts"
    }
    ...
```

#### Database Mikro-ORM

**Cài đặt thư viện**

```bash
yarn add \n
    @mikro-orm/cli \n
    @mikro-orm/core \n
    @mikro-orm/migrations \n
    @mikro-orm/postgresql \n
    pg
```

Cài đặt đường dẫn file config mikro-orm **package.json**

```json
{
    "name": "name-app",
    "mikro-orm": {
        "useTsNode": true,
        "configPaths": [
            "./src/mikro-orm.config.ts",
            "./dist/mikro-orm.config.js"
        ]
    }
}
```

Thêm **Entity: src/entities/Post.js**

```typescript
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Post {
    @PrimaryKey();
    id!: number;

    @Property({ type: "text" })
    title!: string;
    
    @Property({ type: "date" })
    createdAt = new Date();

    @Property({ type: "date", onUpdate: () => new Date() })
    updatedAt = new Date();
}
```

Liên kết Database với Entities + migrations. Create file **mikro-orm.config.ts**

```typescript
export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d\.[tj]s$/
    }
    entities: [Post],
    dbName: '',
    type: 'postgresql',
    debug: true, // Hiển thị thông số debug
} as Parameters<typeof MikroORM.init>[0];
```

Tạo kết nối **src/index.ts**

```typescript
import mikroConfig from './mikro-orm.config';

let orm = await MikroORM.init(mikroConfig);
```

**Tạo file migrate**

[Migration-CLI](https://mikro-orm.io/docs/migrations/#using-via-cli)

> npx mikro-orm migration:create   # Create new migration with current schema diff
> npx mikro-orm migration:up       # Migrate up to the latest version
> npx mikro-orm migration:down     # Migrate one step down
> npx mikro-orm migration:list     # List all executed migrations
> npx mikro-orm migration:pending  # List all pending migrations

**Actions Database**

_run migration_

```typescript
await orm.getMigrator().up();`
```

_create post_

```typescript
const post = orm.em.create(Post, { title: "my first post" })
await orm.em.persistAndFlush(post);
```

_get posts_

```typescript
const posts = await orm.em.find(Post, {});
console.log(posts)
```

#### Express + apollo + graphql

```bash
yarn add \n
    express \n
    apollo-server-express \n        # server cho graphql
    graphql \n
    type-graphql  # Giúp định nghĩa schema cho Entity + Tạo đơn giản các resolver + Đơn giản hóa validate + Có thể kết hợp cùng TypeORM/Mikro-orm
    reflect-metadata    # Cần thiết liên kết type-graphql giữa ObjectType với Entity

yarn add -D \n
    @types/express
```

[**Ví dụ**](https://github.com/MichalLytek/type-graphql/tree/v1.1.1/examples/simple-usage) 

Document API [**http://localhost:4000/graphql**](http://localhost:4000/graphql)

```bash
# Lấy tất cả post
{
  posts {
    id,
    title
  }
}

# Lấy post với id = 2
{
  post(id:2) {
    id
    title
  }
}

# Thêm post 
mutation {
  createPost(title: "test") {
    id
    title
  }
}

# update post theo id
mutation {
  updatePost(id: 18, title: "new title 18") {
    id,
    title,
    updatedAt
  }
}

# delete post theo id
mutation {
  deletePost(id: 22)
}
```

### Auth

```bash
yarn add argon2   # Mã hóa password đánh giá tốt hơn so với bcrypt
```

### Custom

**options Input**

```ts
@InputType()
class UsernamePasswordInput {
    @Field(() => String)
    username: string;

    @Field(() => String)
    password: string;
}


@Resolver()
export class UserResolver {

  @Mutation(() => UserResponse)
  async register(
      @Ctx() { em }: MyContext,
      @Arg('options') options: UsernamePasswordInput
  ): Promise<UserResponse> {
    let { username, password } = options;
    return {}
  }
}
```

**Response**

```ts
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
```

## Documents

https://github.com/benawad/lireddit/blob/2_apollo-server-express-setup/src/index.ts

[source](https://github.com/benawad/lireddit)
3_ 1.16 - 1.41