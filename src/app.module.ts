import { Module } from "@nestjs/common";

import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { JwtService } from "@nestjs/jwt";
import { UserModule } from "./user/user.module";
import { BookModule } from "./book/book.module";
import { IntervalModule } from "./interval/interval.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    BookModule,
    IntervalModule,
  ],
  controllers: [],
  providers: [JwtService],
})
export class AppModule {}
