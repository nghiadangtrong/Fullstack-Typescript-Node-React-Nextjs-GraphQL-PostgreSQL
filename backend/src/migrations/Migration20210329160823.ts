import { Migration } from '@mikro-orm/migrations';

export class Migration20210329160823 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" drop column "salt";');
  }

}
