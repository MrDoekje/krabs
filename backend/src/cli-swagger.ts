import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import metadata from './metadata';
import { CliModule } from './cli/cli-module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Krabs API')
    .setDescription('The Krabs API')
    .setVersion('1.0')
    .addTag('krabs')
    .addServer('http://localhost:3042')
    .build();

  await SwaggerModule.loadPluginMetadata(metadata);

  const document = SwaggerModule.createDocument(app, config, {
    include: [CliModule],
  });

  fs.writeFileSync('../cli-swagger.json', JSON.stringify(document, null, 2));

  await app.close();
}

bootstrap();
