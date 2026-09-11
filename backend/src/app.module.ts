import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { ProjectModule } from './modules/project/project.module';
import { BoardModule } from './modules/board/board.module';
import { SprintModule } from './modules/sprint/sprint.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { IssueModule } from './modules/issue/issue.module';
import { CustomFieldModule } from './modules/custom-field/custom-field.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { PermissionModule } from './modules/permission/permission.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuditModule } from './modules/audit/audit.module';
import { OutboxModule } from './modules/outbox/outbox.module';
import { JobModule } from './modules/job/job.module';
import { StorageModule } from './modules/storage/storage.module';
import { MailModule } from './modules/mail/mail.module';
import { HealthModule } from './modules/health/health.module';
import { SearchModule } from './modules/search/search.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { DashboardModule } from './modules/productivity/dashboard.module';
import { AutomationModule } from './modules/automation/automation.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>('DATABASE_URL');
        const dbHost = config.get<string>('DATABASE_HOST', 'localhost');
        const isSsl = config.get('DATABASE_SSL') === 'true' ||
                      (dbUrl && (dbUrl.includes('supabase') || dbUrl.includes('pooler') || dbUrl.includes('sslmode=require'))) ||
                      (dbHost && dbHost.includes('supabase'));

        const baseOptions: TypeOrmModuleOptions = {
          type: 'postgres',
          ...(dbUrl ? { url: dbUrl } : {
            host: dbHost,
            port: config.get<number>('DATABASE_PORT', 5432),
            username: config.get<string>('DATABASE_USER', 'dev'),
            password: config.get<string>('DATABASE_PASSWORD', 'dev_password'),
            database: config.get<string>('DATABASE_NAME', 'task_manager'),
          }),
          ssl: isSsl ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: false,
          migrationsRun: config.get('RUN_MIGRATIONS', 'false') === 'true',
          migrations: [join(process.cwd(), 'dist/database/migrations/*.{js,ts}')],
          logging: config.get('DATABASE_LOGGING') === 'true',
        };

        return baseOptions;
      },
    }),

    // Event system
    EventEmitterModule.forRoot(),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([{
        ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
        limit: config.get<number>('THROTTLE_LIMIT', 100),
      }]),
    }),

    // Feature modules
    AuthModule,
    OrganizationModule,
    ProjectModule,
    BoardModule,
    SprintModule,
    WorkflowModule,
    SearchModule,
    IssueModule,
    CustomFieldModule,
    CatalogModule,
    PermissionModule,
    NotificationModule,
    AuditModule,
    OutboxModule,
    JobModule,
    StorageModule,
    MailModule,
    HealthModule,
    WebhookModule,
    DashboardModule,
    AutomationModule,
    AdminModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
