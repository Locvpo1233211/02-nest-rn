import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewModule } from './reviews/review.module';
import { RestaurantModule } from './restaurants/restaurant.module';
import { OrderModule } from './orders/order.module';
import { OrderDetailModule } from './order.detail/order.detail.module';
import { MenusModule } from './menus/menus.module';
import { MenuItemsModule } from './menu.items/menu.items.module';
import { MenuItemOptionsModule } from './menu.item.options/menu.item.options.module';
import { LikesModule } from './likes/likes.module';
@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ReviewModule,
    RestaurantModule,
    OrderModule,
    OrderDetailModule,
    MenusModule,
    MenuItemsModule,
    MenuItemOptionsModule,
    LikesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
