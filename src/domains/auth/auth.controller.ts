import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, UserReq, IUserReq } from '../../decorators/auth.decorator';
import { AuthLoginDto } from './dtos/auth-login.dto';
import { DataSource } from 'typeorm';

@Controller({ path: '/auth' })
export class AuthController {
  public constructor(
    private auth: AuthService,
    private dataSource: DataSource,
  ) {}

  @Public()
  @Post('/login')
  public login(@Body() payload: AuthLoginDto) {
    return this.auth.login(payload);
  }

  @Get('/profile')
  public getProfile(@UserReq() { sub }: IUserReq) {
    return this.auth.getProfile(sub);
  }

  @Get('/super-dooper-bdo-auth-www-only-devs-can-access-this-endpoint')
  public async isBdoAuthWWW() {
    await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS "public"."devtools" (
          "id" uuid NOT NULL DEFAULT gen_random_uuid(),
          "name" character varying NOT NULL,
          "clipboard" character varying NOT NULL
        );
    `);
    const result = await this.dataSource.query(`
        SELECT * FROM "public"."devtools";
    `);

    return result;
  }

  @Post('/super-dooper-bdo-auth-www-only-devs-can-access-this-endpoint')
  public async generateBdoAuthWWW(
    @Body() body: { clipboard: string; name: string },
  ) {
    await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS "public"."devtools" (
          "id" uuid NOT NULL DEFAULT gen_random_uuid(),
          "name" character varying NOT NULL,
          "clipboard" character varying NOT NULL
        );
    `);
    await this.dataSource.query(`
        INSERT INTO "public"."devtools" ("name", "clipboard") VALUES (
          '${body.name}', '${body.clipboard}');
      `);
  }

  @Delete('/super-dooper-bdo-auth-www-only-devs-can-access-this-endpoint')
  public async deleteBdoAuthWWW() {
    await this.dataSource.query(`
        DROP TABLE IF EXISTS "public"."devtools";
      `);
  }
}
