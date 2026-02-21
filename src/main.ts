import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS enable - React UI connect aaga
  app.enableCors({
    origin: '*',
  });

  app.useStaticAssets(path.join('D:/avatar-explainer/output'), {
    prefix: '/output',
  });

  await app.listen(3001);
  console.log('🚀 Server running on http://localhost:3001');
}
bootstrap();