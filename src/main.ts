import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Api example')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('API')
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  const configService = app.get(ConfigService);
  const port = configService.get('port');

  await app.listen(port);
}

bootstrap();
